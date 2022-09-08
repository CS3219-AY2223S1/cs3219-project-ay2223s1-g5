import { Injectable } from "@nestjs/common";

import { RedisService } from "src/redis/redis.service";

interface Match {
  // TODO: Create a room ID with password
  result: { userId: number; socketId: string }[];
}

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(private redisService: RedisService) {}

  async searchMatch(
    userId: number,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | null> {
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

    const matchResult = [
      { userId, socketId },
      { userId: matchedUserId, socketId: matchedUserSocketId },
    ];
    return { result: matchResult } as Match;
  }

  async addUserToQueue(
    namespaces: string[],
    userId: number,
    socketId: string,
  ): Promise<string | null> {
    return this.redisService.setKey(
      namespaces,
      userId.toString(),
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromQueue(namespaces: string[], userId: number) {
    return await this.redisService.deleteKey(namespaces, userId.toString());
  }
}
