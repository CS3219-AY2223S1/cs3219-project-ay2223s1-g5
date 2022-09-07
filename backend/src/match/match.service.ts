import { Injectable } from "@nestjs/common";

import { RedisService } from "src/redis/redis.service";
import { UserService } from "src/user/user.service";

interface Match {
  // TODO: Create a room ID with password
  result: { userId: number; socketId: string }[];
}

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(
    private redisService: RedisService,
    private userService: UserService,
  ) {}

  async searchMatch(
    email: string,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | null> {
    const namespaces = [MatchService.NAMESPACE, difficultyLevel];
    const matchedUsers = await this.redisService.getAllKeys(namespaces);

    if (matchedUsers.length === 0) {
      await this.addUserToQueue(email, difficultyLevel, socketId);
      return null;
    }

    const matchedArr = matchedUsers[0].split(":");
    const matchedEmail = matchedArr[matchedArr.length - 1];
    const matchedUserSocketId = await this.redisService.getValue(
      namespaces,
      matchedEmail,
    );

    if (!matchedUserSocketId) {
      await this.addUserToQueue(email, difficultyLevel, socketId);
      return null;
    }

    await this.removeFromMatch(namespaces, matchedEmail);

    return this.createMatch([
      { email, socketId },
      { email: matchedEmail, socketId: matchedUserSocketId },
    ]);
  }

  async createMatch(
    userDetails: { email: string; socketId: string }[],
  ): Promise<Match> {
    const matchResult = [];
    for (const userDetail of userDetails) {
      const userId = await this.getUserId(userDetail.email);
      matchResult.push({ userId: userId, socketId: userDetail.socketId });
    }

    return { result: matchResult } as Match;
  }

  async getUserId(email: string): Promise<number | null> {
    return this.userService.getByEmail(email).then((user) => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    });
  }

  async addUserToQueue(
    email: string,
    difficultyLevel: string,
    socketId: string,
  ): Promise<string | null> {
    return this.redisService.setKey(
      [MatchService.NAMESPACE, difficultyLevel],
      email,
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromMatch(namespaces: string[], email: string) {
    return await this.redisService.deleteKey(namespaces, email);
  }
}
