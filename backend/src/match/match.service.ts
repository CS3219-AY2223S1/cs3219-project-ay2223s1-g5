import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";

import { Match } from "~shared/types/api/match.dto";

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
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

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(namespaces, userId, socketId);
      return null;
    }

    const matchedArr = matchedUsers[0].split(":");
    const matchedUserId = Number(matchedArr[matchedArr.length - 1]);
    const matchedUserSocketId = await this.redisService.getValue(
      namespaces,
      matchedUserId.toString(),
    );

    if (!matchedUserSocketId) {
      await this.addUserToQueue(namespaces, userId, socketId);
      return null;
    }

    await this.removeFromQueue(namespaces, matchedUserId);

    this.logger.info(`${userId} and ${matchedUserId} matched`);
    const matchResult = [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
    return {
      roomId: nanoid(),
      result: matchResult,
    } as Match;
  }

  async addUserToQueue(
    namespaces: string[],
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    this.logger.info(`${userId} added to queue`);
    return this.redisService.setKey(
      namespaces,
      userId.toString(),
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(namespaces: string[], userId: number) {
    this.logger.info(`${userId} removed from queue`);
    return await this.redisService.deleteKey(namespaces, userId.toString());
  }
}
