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
    difficultyLevel: string,
    socketId: string,
  ): Promise<User[] | null> {
    this.logger.info(
      `[${socketId}] Searching for match for ${userId}: ${difficultyLevel}`,
    );
    const namespaces = [QueueService.NAMESPACE, difficultyLevel];
    const matchedUsers = await this.redisService.getAllKeys(namespaces);

    if (this.isUserInQueue(matchedUsers, userId)) {
      return null;
    }

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(difficultyLevel, userId, socketId);
      return null;
    }

    const matchedUserId = this.getUserId(matchedUsers[0]);
    const matchedUserSocketId = await this.redisService.getValue(
      namespaces,
      matchedUserId.toString(),
    );

    if (!matchedUserSocketId) {
      await this.addUserToQueue(difficultyLevel, userId, socketId);
      return null;
    }

    await this.removeFromQueue(matchedUserId);

    this.logger.info(`${userId} and ${matchedUserId} matched`);

    return [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
  }

  async createRoom(users: User[]): Promise<Match> {
    const userIds = users.map((user) => user.userId);
    const roomId = await this.roomService.createRoom(userIds);
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
    difficultyLevel: string,
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    this.logger.info(`${userId} added to queue`);
    await this.redisService.setKey(
      [QueueService.NAMESPACE],
      userId.toString(),
      difficultyLevel,
    );
    return this.redisService.setKey(
      [QueueService.NAMESPACE, difficultyLevel],
      userId.toString(),
      socketId,
      QueueService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(userId: number): Promise<void> {
    const difficultyLevel = await this.redisService.getValue(
      [QueueService.NAMESPACE],
      userId.toString(),
    );

    await this.redisService.deleteKey(
      [QueueService.NAMESPACE],
      userId.toString(),
    );

    if (!difficultyLevel) {
      return;
    }

    const result = await this.redisService.deleteKey(
      [QueueService.NAMESPACE, difficultyLevel],
      userId.toString(),
    );
    if (result === 0) {
      this.logger.info(`${userId} not in queue`);
    } else {
      this.logger.info(`${userId} removed from queue`);
    }
    return;
  }
}
