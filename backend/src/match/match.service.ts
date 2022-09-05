import { Injectable } from "@nestjs/common";

import { RedisService } from "src/redis/redis.service";

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(private redisService: RedisService) {}

  async joinMatch(
    username: string,
    difficultyLevel: string,
  ): Promise<string[]> {
    const matchedUser = await this.redisService
      .getAllKeys(MatchService.NAMESPACE)
      .then((keys) => this.findMatch(keys, difficultyLevel));

    if (matchedUser) {
      return this.removeFromMatch(matchedUser).then(() => [
        matchedUser,
        username,
      ]);
    } else {
      return this.redisService
        .setKey(
          MatchService.NAMESPACE,
          username,
          difficultyLevel,
          MatchService.EXPIRATION_TIME,
        )
        .then(() => []);
    }
  }

  async findMatch(
    usernames: string[],
    difficultyLevel: string,
  ): Promise<string | undefined> {
    return usernames.find(async (username) => {
      const level = await this.redisService.getValue(
        MatchService.NAMESPACE,
        username,
      );
      return level === difficultyLevel;
    });
  }

  async removeFromMatch(username: string) {
    await this.redisService.deleteKey(MatchService.NAMESPACE, username);
  }
}
