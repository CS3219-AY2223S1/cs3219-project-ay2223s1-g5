import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { RedisClientMultiCommandType } from "@redis/client/dist/lib/client/multi-command";
import { PinoLogger } from "nestjs-pino";
import {
  createClient,
  RedisClientType,
  RedisFunctions,
  RedisModules,
  RedisScripts,
} from "redis";

import { ConfigService } from "src/core/config/config.service";

export class RedisTransactionBuilder<
  M extends RedisModules,
  F extends RedisFunctions,
  S extends RedisScripts,
> {
  constructor(private multiCommand: RedisClientMultiCommandType<M, F, S>) {}

  addKeySet(
    namespaces: string[],
    key: string,
    value: string,
  ): RedisTransactionBuilder<M, F, S> {
    const namespace = RedisService.createNamespace(namespaces);
    this.multiCommand = this.multiCommand.v4.sAdd(`${namespace}${key}`, value);
    return this;
  }

  deleteFromSet(
    namespaces: string[],
    key: string,
    value: string,
  ): RedisTransactionBuilder<M, F, S> {
    const namespace = RedisService.createNamespace(namespaces);
    this.multiCommand = this.multiCommand.v4.sRem(`${namespace}${key}`, value);
    return this;
  }

  async execute(): Promise<void> {
    await this.multiCommand.exec();
  }
}

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
      `redis://${configService.get("redis.host")}:${configService.get(
        "redis.port",
      )}`,
    );
    await redisService.connect();
    return redisService;
  }

  constructor(private readonly logger: PinoLogger, url: string) {
    this.redisClient = createClient({ url: url, legacyMode: true });

    this.redisClient.on("connect", () => {
      this.logger.info("Redis client connected successfully");
    });

    this.redisClient.on("error", (error: Error) => {
      this.logger.error(
        `Error occured while connecting or accessing redis server: ${error.message}`,
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
    this.logger.debug(signal);
    await this.redisClient.v4.quit();
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
  ): Promise<number> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.sAdd(`${namespace}${key}`, value);
  }

  async deleteFromSet(
    namespaces: string[],
    key: string,
    value: string,
  ): Promise<number> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.sRem(`${namespace}${key}`, value);
  }

  async getSetSize(namespaces: string[], key: string): Promise<number> {
    const namespace = RedisService.createNamespace(namespaces);
    return this.redisClient.v4.sCard(`${namespace}${key}`);
  }

  transaction() {
    return new RedisTransactionBuilder(this.redisClient.multi());
  }
}
