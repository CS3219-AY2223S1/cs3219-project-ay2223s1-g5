import {
  Controller,
  Delete,
  Get,
  Post,
  Request,
  Session,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { AuthService } from "./auth.service";
import { LocalGuard } from "./local.guard";
import { SessionGuard } from "./session.guard";

import { LoginRes } from "~shared/types/api";

@Controller("sessions")
export class AuthController {
  private readonly secret: string;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post()
  async login(@Session() session: ExpressRequest["session"]) {
    return session.passport?.user.userId;
  }

  @Get()
  async whoAmI(
    @Request() request: ExpressRequest,
    @Session() session: ExpressRequest["session"],
  ): Promise<LoginRes | null> {
    if (!request.isAuthenticated() || !session.passport?.user.userId) {
      return null;
    }
    const user = await this.authService.retrieveUser(
      session.passport?.user.userId,
    );
    return { userId: user.id, email: user.email, name: user.name };
  }

  @UseGuards(SessionGuard)
  @Delete()
  async logout(@Request() request: ExpressRequest) {
    request.logout((error) => {
      this.logger.warn(error);
    });
  }
}
