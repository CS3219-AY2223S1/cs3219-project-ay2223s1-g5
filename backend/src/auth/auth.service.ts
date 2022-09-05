import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { compare } from "bcrypt";

import { ConfigService } from "src/core/config/config.service";
import { UserService } from "src/user/user.service";

const FAILED_LOGIN_LIMIT = 10;

export interface JwtPayload {
  sub: number;
}

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      return null;
    }

    // We perform this check before comparing passwords to avoid information leakage.
    if (user.failedLogins >= FAILED_LOGIN_LIMIT) {
      throw new UnauthorizedException("Account locked.");
    }

    if (!(await compare(password, user.password))) {
      await this.userService.handleFailedLogin(user.id);
      return null;
    }

    // We perform this check after comparing passwords to avoid information leakage.
    if (!user.verified) {
      throw new ForbiddenException("Account not activated.");
    }

    return user;
  }

  async login(user: Express.User) {
    const payload: JwtPayload = { sub: user.userId };
    return {
      accessToken: this.jwtService.sign(payload),
      // TODO: Read token expiry from ConfigService
      expiresIn: this.configService.get("jwt.validity"),
    };
  }
}
