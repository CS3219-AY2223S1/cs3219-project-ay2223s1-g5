import { Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { REDIS_NAMESPACES } from "src/common/constants/namespaces";
import { RedisService } from "src/core/redis/redis.service";
import {
  RoomCreationService,
  RoomServiceInterfaces,
} from "src/room/room.interface";

import { Difficulty, Language } from "~shared/types/base";

type Match = {
  roomId: string;
  result: User[];
};

type User = {
  userId: number;
  socketId: string;
};

@Injectable()
export class QueueService {
  private static readonly SOCKET_TO_QUEUE_NAMESPACE = "SOCKET-TO-QUEUE";
  private static readonly USER_TO_SOCKET_NAMESPACE = "USER-TO-SOCKET";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    @InjectPinoLogger(QueueService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    @Inject(RoomServiceInterfaces.RoomCreationService)
    private readonly roomService: RoomCreationService,
  ) {}

  async getExistingRoom(userId: number): Promise<string | null> {
    return await this.roomService.getRoom(userId);
  }

  async searchMatch(
    userId: number,
    difficulty: Difficulty,
    language: Language,
    socketId: string,
  ): Promise<User[] | null> {
    this.logger.info(
      `[${socketId}] Searching for match for ${userId}: ${difficulty} | ${language}`,
    );
    const namespaces = [
      REDIS_NAMESPACES.QUEUE,
      this.constructQueueKey(difficulty, language),
    ];

    // In the event that new connection occurs and the other connection has
    // not yet disconnected, we remove the previous connection from queue.
    const currentSocket = await this.redisService.getValue(
      [REDIS_NAMESPACES.QUEUE, QueueService.USER_TO_SOCKET_NAMESPACE],
      userId.toString(),
    );
    if (currentSocket) {
      await this.removeFromQueue(userId, currentSocket);
    }

    const matchedUsers = await this.redisService.getAllKeys(namespaces);

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    const matchedUser = await this.getUser(matchedUsers[0]);

    if (!matchedUser) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    const acquired = await this.removeFromQueue(
      matchedUser.userId,
      matchedUser.socketId,
    );
    if (!acquired) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    this.logger.info(`${userId} and ${matchedUser.userId} matched`);

    return [{ userId, socketId }, matchedUser];
  }

  async createRoom(
    language: Language,
    difficulty: Difficulty,
    users: User[],
  ): Promise<Match> {
    const userIds = users.map((user) => user.userId);
    const roomId = await this.roomService.createRoom(
      language,
      difficulty,
      userIds,
    );
    return {
      roomId,
      result: users,
    } as Match;
  }

  private async getUser(matchedUser: string): Promise<User | undefined> {
    const arr = matchedUser.split(":");
    const socketId = arr.pop();

    if (!socketId) {
      return undefined;
    }

    const userId = await this.redisService.getValue(arr, socketId);
    return {
      socketId,
      userId: Number(userId),
    };
  }

  async addUserToQueue(
    difficulty: Difficulty,
    language: Language,
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    this.logger.info(`${userId} added to queue`);
    await this.redisService.setKey(
      [REDIS_NAMESPACES.QUEUE, QueueService.USER_TO_SOCKET_NAMESPACE],
      userId.toString(),
      socketId,
    );
    await this.redisService.setKey(
      [REDIS_NAMESPACES.QUEUE, QueueService.SOCKET_TO_QUEUE_NAMESPACE],
      socketId,
      this.constructQueueKey(difficulty, language),
    );
    return this.redisService.setKey(
      [REDIS_NAMESPACES.QUEUE, this.constructQueueKey(difficulty, language)],
      socketId,
      userId.toString(),
      QueueService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(userId: number, socketId: string): Promise<boolean> {
    await this.redisService.deleteKey(
      [REDIS_NAMESPACES.QUEUE, QueueService.USER_TO_SOCKET_NAMESPACE],
      userId.toString(),
    );

    const queueKey = await this.redisService.getValue(
      [REDIS_NAMESPACES.QUEUE, QueueService.SOCKET_TO_QUEUE_NAMESPACE],
      socketId,
    );

    await this.redisService.deleteKey(
      [REDIS_NAMESPACES.QUEUE, QueueService.SOCKET_TO_QUEUE_NAMESPACE],
      socketId,
    );

    if (!queueKey) {
      return false;
    }

    const result = await this.redisService.deleteKey(
      [REDIS_NAMESPACES.QUEUE, queueKey],
      socketId,
    );
    if (result === 0) {
      this.logger.info(`${socketId} not in queue`);
      return false;
    }
    this.logger.info(`${socketId} removed from queue`);
    return true;
  }

  private constructQueueKey(
    difficulty: Difficulty,
    language: Language,
  ): string {
    return `${difficulty} | ${language}`;
  }
}
