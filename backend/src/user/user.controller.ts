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
  async createUser(@Body() data: CreateUserReq): Promise<void> {
    const user = await this.userService.create(data);
    if (!user) {
      throw new ConflictException();
    }
    // We should not receive any exceptions from this call since the
    // user should not be verified on creation, and the user should exist.
    // In both cases, it should be treated as an internal server error.
    await this.verificationService.sendVerificationEmail(user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Put(":userId(\\d+)")
  async updateUser(
    @Request() req: ExpressRequest,
    @Param("userId", ParseIntPipe) userId: number,
    @Body() data: UpdateUserReq,
  ): Promise<void> {
    if (req.user?.userId != userId) {
      throw new ForbiddenException();
    }
    await this.userService.updateUserDetails(userId, data);
  }
}
