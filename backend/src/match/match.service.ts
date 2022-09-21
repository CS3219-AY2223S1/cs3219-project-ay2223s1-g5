import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";
import { RoomService } from "src/room/room.service";

type Match = {
  roomId: string;
  result: { userId: number; socketId: string }[];
};

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly roomService: RoomService,
  ) {}

  async searchMatch(
    userId: number,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | null> {
    this.logger.info(
      `[${socketId}] Searching for match for ${userId}: ${difficultyLevel}`,
    );
    const namespaces = [MatchService.NAMESPACE, difficultyLevel];
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
    const roomId = await this.roomService.createRoom([userId, matchedUserId]);
    const matchResult = [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
    return {
      roomId,
      result: matchResult,
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
      [MatchService.NAMESPACE],
      userId.toString(),
      difficultyLevel,
    );
    return this.redisService.setKey(
      [MatchService.NAMESPACE, difficultyLevel],
      userId.toString(),
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(userId: number): Promise<void> {
    const difficultyLevel = await this.redisService.getValue(
      [MatchService.NAMESPACE],
      userId.toString(),
    );

    await this.redisService.deleteKey(
      [MatchService.NAMESPACE],
      userId.toString(),
    );

    if (!difficultyLevel) {
      return;
    }

    const result = await this.redisService.deleteKey(
      [MatchService.NAMESPACE, difficultyLevel],
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
