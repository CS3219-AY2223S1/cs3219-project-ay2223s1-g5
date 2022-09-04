import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnApplicationShutdown {
  redisClient: RedisClientType;

  constructor() {
    // TODO: Use different URL for dev and prod instance
    this.redisClient = createClient({
      url: "redis://localhost:6379",
    });

    this.redisClient.on("connection", () => {
      console.log("Redis client connected successfully");
    });

    this.redisClient.on("error", () => {
      console.error("Error occured while connecting or accessing redis server");
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
  static async create() {
    const redisService = new RedisService();
    await redisService.connect();
    return redisService;
  }

  async onApplicationShutdown(signal: string) {
    console.log(signal);
    await this.redisClient.quit();
  }
}
