import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";

type Match = {
  roomId: string;
  result: { userId: number; socketId: string }[];
};

@Injectable()
export class MatchService {
  private static readonly MATCH_NAMESPACE = "Match";
  private static readonly ROOM_NAMESPACE = "ROOM";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
  ) {}

  // TODO: Prevent users from matching themselves if they have multiple tabs open
  async searchMatch(
    userId: number,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | null> {
    this.logger.info(
      `[${socketId}] Searching for match for ${userId}: ${difficultyLevel}`,
    );
    const namespaces = [MatchService.MATCH_NAMESPACE, difficultyLevel];
    const matchedUsers = await this.redisService.getAllKeys(namespaces);

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(difficultyLevel, userId, socketId);
      return null;
    }

    const matchedArr = matchedUsers[0].split(":");
    const matchedUserId = Number(matchedArr[matchedArr.length - 1]);
    const matchedUserSocketId = await this.redisService.getValue(
      namespaces,
      matchedUserId.toString(),
    );

    if (!matchedUserSocketId) {
      await this.addUserToQueue(difficultyLevel, userId, socketId);
      return null;
    }

    await this.removeFromQueue(difficultyLevel, matchedUserId);

    this.logger.info(`${userId} and ${matchedUserId} matched`);
    const roomId = nanoid();
    await this.createMappings([userId, matchedUserId], roomId);
    const matchResult = [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
    return {
      roomId,
      result: matchResult,
    } as Match;
  }

  async createMappings(userIds: number[], roomId: string): Promise<void> {
    for (const userId of userIds) {
      await this.redisService.addKeySet(
        [MatchService.ROOM_NAMESPACE],
        roomId,
        userId.toString(),
      );

      await this.redisService.setKey(
        [MatchService.ROOM_NAMESPACE],
        userId.toString(),
        roomId,
      );
    }
  }

  async addUserToQueue(
    difficultyLevel: string,
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    this.logger.info(`${userId} added to queue`);
    return this.redisService.setKey(
      [MatchService.MATCH_NAMESPACE, difficultyLevel],
      userId.toString(),
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(
    difficultyLevel: string,
    userId: number,
  ): Promise<void> {
    const result = await this.redisService.deleteKey(
      [MatchService.MATCH_NAMESPACE, difficultyLevel],
      userId.toString(),
    );
    if (result === 0) {
      this.logger.info(`${userId} not in queue`);
    } else {
      this.logger.info(`${userId} removed from queue`);
    }
    return;
  }

  async removeRoom(roomId: string): Promise<void> {
    this.logger.info(`Removing room ${roomId}`);
    const users = await this.redisService.getSet(
      [MatchService.ROOM_NAMESPACE],
      roomId,
    );

    await this.redisService.deleteKey([MatchService.ROOM_NAMESPACE], roomId);

    for (const user of users) {
      await this.redisService.deleteKey([MatchService.ROOM_NAMESPACE], user);
    }
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [MatchService.ROOM_NAMESPACE],
      userId.toString(),
    );
  }
}
