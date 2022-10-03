import { Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";
import {
  RoomCreationService,
  RoomServiceInterfaces,
} from "src/room/room.interface";

type User = {
  userId: number;
  socketId: string;
};

import { Difficulty, Language } from "~shared/types/base";

type Match = {
  roomId: string;
  result: User[];
};

@Injectable()
export class QueueService {
  private static readonly NAMESPACE = "Queue";
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

    if (this.isUserInQueue(matchedUsers, userId)) {
      return null;
    }

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    const matchedUserId = this.getUserId(matchedUsers[0]);
    const matchedUserSocketId = await this.redisService.getValue(
      namespaces,
      matchedUserId.toString(),
    );

    if (!matchedUserSocketId) {
      await this.addUserToQueue(difficulty, language, userId, socketId);
      return null;
    }

    await this.removeFromQueue(matchedUserId);

    this.logger.info(`${userId} and ${matchedUserId} matched`);

    return [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
  }

  async createRoom(language: Language, users: User[]): Promise<Match> {
    const userIds = users.map((user) => user.userId);
    const roomId = await this.roomService.createRoom(language, userIds);
    return {
      roomId,
      result: users,
    } as Match;
  }

  private getUserId(matchedUser: string): number {
    const arr = matchedUser.split(":");
    return Number(arr[arr.length - 1]);
  }

  private isUserInQueue(matchedUsers: string[], userId: number): boolean {
    return matchedUsers.some(
      (matchedUser: string) => this.getUserId(matchedUser) === userId,
    );
  }

  async addUserToQueue(
    difficulty: Difficulty,
    language: Language,
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    this.logger.info(`${userId} added to queue`);
    await this.redisService.setKey(
      [QueueService.NAMESPACE],
      userId.toString(),
      this.constructQueueKey(difficulty, language),
    );
    return this.redisService.setKey(
      [QueueService.NAMESPACE, this.constructQueueKey(difficulty, language)],
      userId.toString(),
      socketId,
      QueueService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(userId: number): Promise<void> {
    const queueKey = await this.redisService.getValue(
      [QueueService.NAMESPACE],
      userId.toString(),
    );

    await this.redisService.deleteKey(
      [QueueService.NAMESPACE],
      userId.toString(),
    );

    if (!queueKey) {
      return;
    }

    const result = await this.redisService.deleteKey(
      [QueueService.NAMESPACE, queueKey],
      userId.toString(),
    );
    if (result === 0) {
      this.logger.info(`${userId} not in queue`);
    } else {
      this.logger.info(`${userId} removed from queue`);
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
