import { Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

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
  private static readonly NAMESPACE = "Queue";
  private static readonly USER_TO_SOCKET = "UserToSocket";
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
      QueueService.NAMESPACE,
      this.constructQueueKey(difficulty, language),
    ];
    const matchedUsers = await this.redisService.getAllKeys(namespaces);

    // In the event that new connection occurs and the other connection has
    // not yet disconnected, we remove the previous connection from queue.
    const currentSocket = await this.redisService.getValue(
      [QueueService.NAMESPACE, QueueService.USER_TO_SOCKET],
      userId.toString(),
    );
    if (currentSocket) {
      await this.removeFromQueue(userId, currentSocket);
    }

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    const matchedUser = await this.getUser(matchedUsers[0]);

    if (!matchedUser) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    await this.removeFromQueue(matchedUser.userId, matchedUser.socketId);

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
      [QueueService.NAMESPACE, QueueService.USER_TO_SOCKET],
      userId.toString(),
      socketId,
    );
    await this.redisService.setKey(
      [QueueService.NAMESPACE],
      socketId,
      this.constructQueueKey(difficulty, language),
    );
    return this.redisService.setKey(
      [QueueService.NAMESPACE, this.constructQueueKey(difficulty, language)],
      socketId,
      userId.toString(),
      QueueService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(userId: number, socketId: string): Promise<void> {
    await this.redisService.deleteKey(
      [QueueService.NAMESPACE, QueueService.USER_TO_SOCKET],
      userId.toString(),
    );

    const queueKey = await this.redisService.getValue(
      [QueueService.NAMESPACE],
      socketId,
    );

    await this.redisService.deleteKey([QueueService.NAMESPACE], socketId);

    if (!queueKey) {
      return;
    }

    const result = await this.redisService.deleteKey(
      [QueueService.NAMESPACE, queueKey],
      socketId,
    );
    if (result === 0) {
      this.logger.info(`${socketId} not in queue`);
    } else {
      this.logger.info(`${socketId} removed from queue`);
    }
    return;
  }

  private constructQueueKey(
    difficulty: Difficulty,
    language: Language,
  ): string {
    return `${difficulty} | ${language}`;
  }
}
