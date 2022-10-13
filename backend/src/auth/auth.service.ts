import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { User } from "@prisma/client";
import { compare } from "bcrypt";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { InternalServerError } from "src/common/errors/internal-server.error";
import { UserService } from "src/user/user.service";

const FAILED_LOGIN_LIMIT = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectPinoLogger(AuthService.name)
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
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

  async retrieveUser(
    userId: number,
  ): Promise<Pick<User, "id" | "name" | "email">> {
    const user = await this.userService.getById(userId);
    if (!user) {
      this.logger.error(`Unable to retrieve user: ${userId}`);
      throw new InternalServerError();
    }
    return { id: user.id, name: user.name, email: user.email };
  }
}
