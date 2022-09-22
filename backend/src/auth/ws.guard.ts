import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { Socket } from "socket.io";

import { ConfigService } from "src/core/config/config.service";
import { RedisService } from "src/redis/redis.service";

import { JWT_NAMESPACE } from "./auth.controller";
import { JwtPayload } from "./auth.service";

import { JWT_COOKIE_NAME } from "~shared/constants";

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly secret: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.secret = configService.get("jwt.secret");
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    if (!client.handshake.headers.cookie) {
      return false;
    }
    const cookies = parse(client.handshake.headers.cookie);
    if (!cookies[JWT_COOKIE_NAME]) {
      return false;
    }
    if (
      await this.redisService.getValue(
        [JWT_NAMESPACE],
        cookies[JWT_COOKIE_NAME],
      )
    ) {
      return false;
    }
    try {
      const payload = verify(cookies[JWT_COOKIE_NAME], this.secret, {
        ignoreExpiration: false,
      }) as unknown as JwtPayload;
      // We store the userId in the authorization header of the access token for
      // easy access later on.
      context.switchToWs().getClient<Socket>().handshake.headers.authorization =
        payload.sub.toString();
      return true;
    } catch (e: unknown) {
      return false;
    }
  }
}
