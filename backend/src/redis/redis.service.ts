import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import { createClient, RedisClientType } from "redis";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private static readonly NAMESPACE_DELIMETER = ":";
  private redisClient: RedisClientType;

  /**
   * This static factory function serves as the user-facing constructor
   * for this class.
   * It allows us to leverage the `async`-`await` syntax.
   */
  static async create(logger: PinoLogger, configService: ConfigService) {
    const redisService = new RedisService(
      logger,
      configService.get("redis.url"),
    );
    await redisService.connect();
    return redisService;
  }

  constructor(private readonly logger: PinoLogger, url: string) {
    this.redisClient = createClient({ url: url, legacyMode: true });

    this.redisClient.on("connection", () => {
      this.logger.info("Redis client connected successfully");
    });

    this.redisClient.on("error", (error: string) => {
      this.logger.error(
        `Error occured while connecting or accessing redis server: ${error}`,
      );
    });
  }

  getClient(): RedisClientType {
    return this.redisClient;
  }

  async connect() {
    await this.redisClient.connect();
  }

  async onApplicationShutdown(signal: string) {
    this.logger.info(signal);
    await this.redisClient.quit();
  }

  static createNamespace(namespaces: string[]): string {
    return namespaces.join(this.NAMESPACE_DELIMETER) + this.NAMESPACE_DELIMETER;
  }

  async setKey(
    namespaces: string[],
    key: string,
    value: string,
    expirationTime?: number,
  ): Promise<string | null> {
    const namespace = RedisService.createNamespace(namespaces);
    const keyWithNamespace = `${namespace}${key}`;
    if (expirationTime) {
      return this.redisClient.v4.set(keyWithNamespace, value, {
        EX: expirationTime,
      });
    } else {
      return this.redisClient.v4.set(keyWithNamespace, value);
    }
  }

  async getAllKeys(namespaces: string[]): Promise<string[]> {
    const namespace = RedisService.createNamespace(namespaces);
    console.log(await this.redisClient.keys(`${namespace}*`));
    return this.redisClient.v4.keys(`${namespace}*`);
  }

  async deleteKey(namespaces: string[], key: string): Promise<number> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.del(`${namespace}${key}`);
  }

  async getValue(namespaces: string[], key: string): Promise<string | null> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.get(`${namespace}${key}`);
  }

  async getSet(namespaces: string[], key: string): Promise<string[]> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.sMembers(`${namespace}${key}`);
  }

  async addKeySet(
    namespaces: string[],
    key: string,
    value: string,
  ): Promise<void> {
    const namespace = RedisService.createNamespace(namespaces);
    this.redisClient.v4.sAdd(`${namespace}${key}`, value);
  }

  async deleteFromSet(
    namespaces: string[],
    key: string,
    value: string,
  ): Promise<void> {
    const namespace = RedisService.createNamespace(namespaces);
    this.redisClient.v4.sRem(`${namespace}${key}`, value);
  }

  async getSetSize(namespaces: string[], key: string): Promise<number> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.sCard(`${namespace}${key}`);
  }
}
