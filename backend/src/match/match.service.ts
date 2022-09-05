import { Injectable } from "@nestjs/common";

import { RedisService } from "src/redis/redis.service";

interface Match {
  emailOne: string;
  emailTwo: string;
  socketOne: string;
  socketTwo: string;
}

@Injectable()
export class MatchService {
  private static readonly NAMESPACE = "Match";
  private static readonly EXPIRATION_TIME = 30;

  constructor(private redisService: RedisService) {}

  async searchMatch(
    email: string,
    difficultyLevel: string,
    socketId: string,
  ): Promise<Match | undefined> {
    const matchedUsers = await this.redisService.getAllKeys(
      `${MatchService.NAMESPACE}-${difficultyLevel}`,
    );

    if (matchedUsers.length === 0) {
      return this.addUserToQueue(email, difficultyLevel, socketId).then();
    }

    const matchedUser = matchedUsers[0];
    const [matchedNamespace, matchedEmail] = matchedUser.split(":");
    const matchedUserSocketId = await this.redisService.getValue(
      matchedNamespace,
      matchedEmail,
    );

    if (!matchedUserSocketId) {
      return this.addUserToQueue(email, difficultyLevel, socketId).then();
    }

    return this.removeFromMatch(matchedNamespace, matchedEmail).then(() => {
      const match: Match = {
        emailOne: email,
        emailTwo: matchedEmail,
        socketOne: socketId,
        socketTwo: matchedUserSocketId,
      };
      return match;
    });
  }

  async addUserToQueue(
    email: string,
    difficultyLevel: string,
    socketId: string,
  ): Promise<string | null> {
    return this.redisService.setKey(
      `${MatchService.NAMESPACE}-${difficultyLevel}`,
      email,
      socketId,
      MatchService.EXPIRATION_TIME,
    );
  }

  async removeFromMatch(namespace: string, email: string) {
    return await this.redisService.deleteKey(namespace, email);
  }
}
