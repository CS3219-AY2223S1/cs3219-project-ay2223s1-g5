import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";

import { JwtAuthGuard } from "src/auth/jwt.guard";
import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { UnauthorizedError } from "src/common/errors/unauthorized.error";
import { VerificationService } from "src/verification/verification.service";

import { ResetPasswordService } from "./reset-password.service";
import { UserService } from "./user.service";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  ResetPasswordReq,
  UpdateUserReq,
} from "~shared/types/api";

@Controller("users")
export class UserController {
  constructor(
    private userService: UserService,
    private verificationService: VerificationService,
    private resetPasswordService: ResetPasswordService,
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

  // @UseGuards(JwtAuthGuard)
  @Get(":userId(\\d+)")
  async getUserName(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<GetUserNameRes | null> {
    const user = await this.userService.getById(userId);
    if (!user) {
      return null;
    }
    const { name } = user;
    return { name };
  }

  @Post("reset-password")
  async requestResetPassword(
    @Body() { email }: RequestResetPasswordReq,
  ): Promise<void> {
    try {
      await this.resetPasswordService.sendResetPasswordEmail(email);
    } catch (e: unknown) {
      // We silently fail invalid emails.
      if (!(e instanceof EntityNotFoundError)) {
        return;
      }
      throw e;
    }
  }

  @Patch("reset-password")
  async resetPassword(
    @Body() { userId, code, password }: ResetPasswordReq,
  ): Promise<void> {
    await this.resetPasswordService.resetPassword(userId, code, password);
  }
}
