import {
  Controller,
  InternalServerErrorException,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";

import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local.guard";

@Controller("sessions")
export class AuthController {
  constructor(private service: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  async login(@Request() req: ExpressRequest) {
    // LocalAuthGuard should have set req.user
    if (!req.user) {
      throw new InternalServerErrorException();
    }
    return this.service.login(req.user);
  }
}
