import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";

import { JwtAuthGuard } from "src/auth/jwt.guard";
import { VerificationService } from "src/verification/verification.service";

import { UserService } from "./user.service";

import { CreateUserReq, UpdateUserReq } from "~shared/types/api";

@Controller("users")
export class UserController {
  constructor(
    private userService: UserService,
    private verificationService: VerificationService,
  ) {}

  @Post()
  async createUser(@Body() data: CreateUserReq) {
    const user = await this.userService.create(data);
    if (!user) {
      throw new ConflictException();
    }
    await this.verificationService.sendVerificationEmail(user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":userId(\\d+)")
  async updateUser(
    @Request() req: ExpressRequest,
    @Param("userId", ParseIntPipe) userId: number,
    @Body() data: UpdateUserReq,
  ) {
    if (req.user?.userId != userId) {
      throw new ForbiddenException();
    }
    return this.userService.updateUserDetails(userId, data);
  }
}
