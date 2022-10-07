import { Injectable, NestMiddleware } from "@nestjs/common";
import RedisStore from "connect-redis";
import { NextFunction, Request, RequestHandler, Response } from "express";
import session from "express-session";

import { ConfigService } from "src/core/config/config.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private middleware: RequestHandler;

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {
    this.middleware = session({
      name: this.config.get("session.name"),
      secret: this.config.get("session.secret"),
      cookie: {
        httpOnly: true,
        sameSite: "strict",
        maxAge: this.config.get("session.maxAge"),
        secure: this.config.get("environment") !== "development",
      },
      resave: false,
      saveUninitialized: false,
      store: new (RedisStore(session))({
        client: this.redis.getClient(),
        prefix: "SESSION:",
      }),
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next);
  }
}
