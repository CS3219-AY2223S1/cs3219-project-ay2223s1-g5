import { INestApplication, NestMiddleware } from "@nestjs/common";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { Request, Response } from "express";
import passport from "passport";
import { Server, ServerOptions, Socket } from "socket.io";
import { ExtendedError, Namespace } from "socket.io/dist/namespace";

import { SessionMiddleware } from "src/common/middlewares/SessionMiddleware";
import { ConfigService } from "src/core/config/config.service";
import { RedisService } from "src/redis/redis.service";

export const session = (socket: Socket): Request["session"] => {
  return (socket.request as Request).session;
};

export const wrap =
  (middleware: NestMiddleware) =>
  (socket: Socket, next: (error?: ExtendedError) => void) =>
    middleware.use(socket.request, {}, next);

export function serverMiddlewareSetup(
  server: Server,
  middleware: NestMiddleware,
): Server;
export function serverMiddlewareSetup(
  server: Namespace,
  middleware: NestMiddleware,
): Namespace;

export function serverMiddlewareSetup(
  server: Server | Namespace,
  middleware: NestMiddleware,
): Server | Namespace {
  server.use(wrap(middleware));
  server.use((socket: Socket, next: (e?: ExtendedError) => void) => {
    return passport.initialize()(
      socket.request as Request,
      {} as Response,
      (e?: Error | "router" | "route") => {
        if (typeof e === "string") {
          // passport.initialize only ever calls next()
          // so this should be safe.
          next();
          return;
        }
        next(e);
      },
    );
  });
  server.use((socket: Socket, next: (e?: ExtendedError) => void) => {
    return passport.session()(
      socket.request as Request,
      {} as Response,
      (e?: ExtendedError) => next(e),
    );
  });
  server.use((socket: Socket, next: (error?: ExtendedError) => void) => {
    const request = socket.request as Request;
    if (request.isAuthenticated()) {
      next();
    } else {
      next(new Error("Unauthorized"));
    }
  });
  return server;
}

export class SocketSessionAdapter extends IoAdapter {
  constructor(
    private readonly context: INestApplication,
    private readonly middlewareFactory: (
      config: ConfigService,
      redis: RedisService,
    ) => NestMiddleware,
  ) {
    super(context);
  }

  // We must override create instead of createIoServer since
  // middlewares are namespace scoped.
  create(
    port: number,
    options?: ServerOptions & {
      namespace?: string;
      server?: any;
    },
  ): Server {
    const server = super.create(port, options) as Server;

    const middleware = this.middlewareFactory(
      this.context.get(ConfigService),
      this.context.get(RedisService),
    );

    return serverMiddlewareSetup(server, middleware);
  }
}
