import { Injectable } from "@nestjs/common";
import * as redis from "redis";
import { RedisClientType } from "redis";

@Injectable()
export class MatchService {
  redisClient: RedisClientType;

  constructor() {
    // TODO: Use different URL for dev and prod instance
    this.redisClient = redis.createClient({
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

  async endConnection() {
    await this.redisClient.quit();
  }
}
