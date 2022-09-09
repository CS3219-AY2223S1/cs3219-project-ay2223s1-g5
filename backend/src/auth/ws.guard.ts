import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { parse } from "cookie";
import { verify } from "jsonwebtoken";
import { Observable } from "rxjs";
import { Socket } from "socket.io";

import { ConfigService } from "src/core/config/config.service";

import { JwtPayload } from "./auth.service";

@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly secret: string;
  constructor(private readonly configService: ConfigService) {
    this.secret = configService.get("jwt.secret");
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    if (!client.handshake.headers.cookie) {
      return false;
    }
    const cookies = parse(client.handshake.headers.cookie);
    if (!cookies["accessToken"]) {
      return false;
    }
    try {
      const payload = verify(cookies["accessToken"], this.secret, {
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
