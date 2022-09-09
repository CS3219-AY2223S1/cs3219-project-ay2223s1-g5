import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import { User } from "@prisma/client";
import {
  CookieOptions,
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { verify } from "jsonwebtoken";

import { ConfigService } from "src/core/config/config.service";

import { AuthService, JwtPayload } from "./auth.service";
import { LocalAuthGuard } from "./local.guard";

import { LoginRes } from "~shared/types/api/auth.dto";

@Controller()
export class AuthController {
  private readonly secret: string;

  constructor(
    private service: AuthService,
    private configService: ConfigService,
  ) {
    this.secret = configService.get("jwt.secret");
  }

  @UseGuards(LocalAuthGuard)
  @Post("sessions")
  async login(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    // LocalAuthGuard should have set req.user
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    const { user, accessToken } = await this.service.login(req.user);
    return this.sendJwtPayload(res, user, accessToken);
  }

  @Get("whoami")
  async whoAmI(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
  ) {
    if (!req.cookies["accessToken"]) {
      res.json();
      return;
    }
    // We perform the validation manually to prevent throwing 401 error.
    try {
      const payload = verify(req.cookies["accessToken"], this.secret, {
        ignoreExpiration: false,
      }) as unknown as JwtPayload;
      const userId = +payload.sub;
      const { user, accessToken } = await this.service.login({ userId });
      // We resend a new JWT to refresh its duration.
      return this.sendJwtPayload(res, user, accessToken);
    } catch (e: unknown) {
      // Token is invalid or expired.
      res.json();
    }
  }

  private sendJwtPayload(
    res: ExpressResponse,
    user: User,
    accessToken: string,
  ) {
    const responseBody: LoginRes = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const cookieOptions: CookieOptions = {
      maxAge: this.configService.get("jwt.validity"),
      httpOnly: true,
      sameSite: "strict",
      secure: this.configService.get("environment") !== "development",
    };

    return res
      .cookie("accessToken", accessToken, cookieOptions)
      .status(200)
      .json(responseBody);
  }
}
