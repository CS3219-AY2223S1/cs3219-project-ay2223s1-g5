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
    console.log(signal);
    await this.redisClient.quit();
  }
}
