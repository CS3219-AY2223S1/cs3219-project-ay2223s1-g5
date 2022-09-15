import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "src/core/config/config.service";

import { JwtPayload } from "./auth.service";

import { JWT_COOKIE_NAME } from "~shared/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request.cookies[JWT_COOKIE_NAME] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get("jwt.secret"),
    });
  }

  async validate(payload: JwtPayload): Promise<Express.User> {
    return { userId: payload.sub };
  }
}
