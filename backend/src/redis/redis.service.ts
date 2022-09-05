import { Injectable, Logger, OnApplicationShutdown } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: RedisClientType;

  constructor(url: string) {
    this.redisClient = createClient({ url: url });

    this.redisClient.on("connection", () => {
      this.logger.log("Redis client connected successfully");
    });

    this.redisClient.on("error", () => {
      this.logger.error(
        "Error occured while connecting or accessing redis server",
      );
    });
  }

  async connect() {
    await this.redisClient.connect();
  }

  /**
   * This static factory function serves as the user-facing constructor
   * for this class.
   * It allows us to leverage the `async`-`await` syntax.
   */
  static async create(configService: ConfigService) {
    const redisService = new RedisService(configService.get("redis.url"));
    await redisService.connect();
    return redisService;
  }

  async onApplicationShutdown(signal: string) {
    this.logger.log(signal);
    await this.redisClient.quit();
  }

  async setKey(
    key: string,
    value: string,
    expirationTime: number,
  ): Promise<string | null> {
    return this.redisClient.set(key, value, { EX: expirationTime });
  }

  async getAllKeys(): Promise<string[]> {
    return this.redisClient.keys("*");
  }

  async deleteKey(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
}
