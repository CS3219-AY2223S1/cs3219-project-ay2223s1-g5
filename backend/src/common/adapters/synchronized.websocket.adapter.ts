import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { createClient, RedisClientType } from "redis";
import { Namespace, Server, ServerOptions } from "socket.io";

import { ConfigService } from "src/core/config/config.service";

export class SynchronizedSocketAdapter extends IoAdapter {
  private adapter: (nsp: Namespace) => RedisAdapter;
  private publishClient: RedisClientType;
  private subscribeClient: RedisClientType;

  constructor(protected readonly context: INestApplication) {
    super(context);
  }

  async activate(): Promise<void> {
    const url = this.context.get(ConfigService).get("redis.url");

    this.publishClient = createClient({ url });
    this.subscribeClient = createClient({ url });

    await Promise.all([
      this.publishClient.connect(),
      this.subscribeClient.connect(),
    ]);

    this.adapter = createAdapter(this.publishClient, this.subscribeClient);
  }

  async deactivate(): Promise<void> {
    await this.publishClient.quit();
    await this.subscribeClient.quit();
  }

  createIOServer(port: number, options: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;
    server.adapter(this.adapter);
    return server;
  }
}
