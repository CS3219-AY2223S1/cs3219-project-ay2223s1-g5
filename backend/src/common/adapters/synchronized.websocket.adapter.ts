import { INestApplication } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { createAdapter, RedisAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import { Namespace, Server, ServerOptions } from "socket.io";

import { ConfigService } from "src/core/config/config.service";

export class SynchronizedSocketAdapter extends IoAdapter {
  private adapterConstructor: (nsp: Namespace) => RedisAdapter;

  constructor(protected readonly context: INestApplication) {
    super(context);
  }

  async activate(): Promise<void> {
    const url = this.context.get(ConfigService).get("redis.url");

    const publishClient = createClient({ url });
    const subscribeClient = createClient({ url });

    await Promise.all([publishClient.connect(), subscribeClient.connect()]);

    this.adapterConstructor = createAdapter(publishClient, subscribeClient);
  }

  createIOServer(port: number, options: ServerOptions) {
    const server = super.createIOServer(port, options) as Server;
    console.log(server);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
