import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // We remap the username field to email
    // for consistency with our database schema
    super({ usernameField: "email" });
  }

  async validate(email: string, password: string): Promise<Express.User> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Incorrect email or password.");
    }
    return { userId: user.id };
  }
}
