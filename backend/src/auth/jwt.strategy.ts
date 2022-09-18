import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "src/core/config/config.service";
import { RedisService } from "src/redis/redis.service";

import { JWT_NAMESPACE } from "./auth.controller";
import { JwtPayload } from "./auth.service";

import { JWT_COOKIE_NAME } from "~shared/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request.cookies[JWT_COOKIE_NAME] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt.secret"),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<Express.User> {
    if (
      await this.redisService.getValue(
        [JWT_NAMESPACE],
        req.cookies[JWT_COOKIE_NAME],
      )
    ) {
      throw new UnauthorizedException("Invalidated token");
    }
    return { userId: payload.sub };
  }
}
