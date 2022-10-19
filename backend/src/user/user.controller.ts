import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Session,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";
import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { VerificationError } from "src/common/errors/verification.error";

import { ResetPasswordService } from "./reset-password/reset-password.service";
import { VerificationService } from "./verification/verification.service";
import { UserService } from "./user.service";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  RequestVerifyEmailReq,
  ResetPasswordReq,
  UpdatePasswordReq,
  UpdateUserReq,
  VerifyEmailReq,
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
      throw new ConflictException("A user with the same email already exists.");
    }
    // We should not receive any exceptions from this call since the
    // user should not be verified on creation, and the user should exist.
    // In both cases, it should be treated as an internal server error.
    await this.verificationService.sendVerificationEmail(user.email);
  }

  @UseGuards(SessionGuard)
  @Patch()
  async updateUser(
    @Session() session: Request["session"],
    @Body() data: UpdateUserReq,
  ): Promise<void> {
    await this.userService.updateUserDetails(
      session.passport?.user.userId || 0,
      data,
    );
  }

  @UseGuards(SessionGuard)
  @Get(":userId(\\d+)")
  async getUserName(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<GetUserNameRes | null> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new NotFoundException("User not found.");
    }
    const { name } = user;
    return { name };
  }

  @UseGuards(SessionGuard)
  @Post("password")
  async updatePassword(
    @Session() session: Request["session"],
    @Body() data: UpdatePasswordReq,
  ): Promise<void> {
    const { oldPassword, newPassword } = data;
    await this.userService.updateUserPassword(
      session.passport?.user.userId || 0,
      oldPassword,
      newPassword,
    );
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

  @Post("verifications")
  async resendVerificationEmail(
    @Body() { email }: RequestVerifyEmailReq,
  ): Promise<void> {
    try {
      return await this.verificationService.sendVerificationEmail(email);
    } catch (e: unknown) {
      if (!(e instanceof VerificationError)) {
        throw e;
      }
      throw new ConflictException(e.message);
    }
  }

  @Patch("verifications")
  async checkVerificationCode(
    @Body() { userId, code }: VerifyEmailReq,
  ): Promise<void> {
    const result = await this.verificationService.checkVerificationCode(
      userId,
      code,
    );
    if (!result) {
      throw new UnauthorizedException("Failed to verify user email.");
    }
  }
}
