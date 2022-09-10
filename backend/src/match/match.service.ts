import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";
import { UserService } from "src/user/user.service";

interface Match {
  roomId: string;
  result: { userId: number; socketId: string }[];
  userNames: string[];
}

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async searchMatch(
    userId: number,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | null> {
    this.logger.info(
      `Matching Service: Searching match for ${userId} ${difficultyLevel} ${socketId}`,
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
      userNames: await this.getUserNames([userId, matchedUserId]),
    } as Match;
  }

  async getUserNames(userIds: number[]): Promise<string[]> {
    const userNames: string[] = [];

    userIds.forEach(async (userId) => {
      const user = await this.userService.getById(userId);
      if (user) {
        userNames.push(user.name);
      }
    });

    return userNames;
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
