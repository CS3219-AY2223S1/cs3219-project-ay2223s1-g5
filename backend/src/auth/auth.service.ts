import { Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { compare } from "bcrypt";
import { User } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "src/core/config/config.service";

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
    if (!user || !(await compare(password, user.password))) {
      // TODO: If login fails, we increment the failedLogin count.
      // TODO: If failedLogin count exceeds a threshold, we return an error.
      // TODO: Prevent login if user is not verified and return a special error.
      return null;
    }
    return user;
  }

  async login(user: Express.User) {
    const payload: JwtPayload = { sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: "Bearer",
      // TODO: Read token expiry from ConfigService
      expires_in: this.configService.get("jwt.validity"),
    };
  }
}
