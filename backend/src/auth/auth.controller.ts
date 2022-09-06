import {
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import {
  CookieOptions,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import { ConfigService } from "src/core/config/config.service";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local.guard";

import { LoginRes } from "~shared/types/api/auth.dto";

@Controller("sessions")
export class AuthController {
  constructor(
    private service: AuthService,
    private configService: ConfigService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    // LocalAuthGuard should have set req.user
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    const { user, accessToken, expiresIn } = await this.service.login(req.user);
    const responseBody: LoginRes = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const cookieOptions: CookieOptions = {
      maxAge: expiresIn,
      httpOnly: true,
      sameSite: "strict",
      secure: this.configService.get("environment") !== "development",
    };

    // TODO: create constants folder to place magic strings
    res
      .cookie("accessToken", accessToken, cookieOptions)
      .status(201)
      .json(responseBody);
  }
}
