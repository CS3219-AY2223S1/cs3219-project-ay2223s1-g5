import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Session,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";
import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { VerificationService } from "src/verification/verification.service";

import { ResetPasswordService } from "./reset-password.service";
import { UserService } from "./user.service";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  ResetPasswordReq,
  UpdatePasswordReq,
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

  @UseGuards(SessionGuard)
  @Put(":userId(\\d+)")
  async updateUser(
    @Session() session: Request["session"],
    @Param("userId", ParseIntPipe) userId: number,
    @Body() data: UpdateUserReq,
  ): Promise<void> {
    if (session.passport?.user.userId != userId) {
      throw new ForbiddenException();
    }
    await this.userService.updateUserDetails(userId, data);
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
  @Post(":userId(\\d+)")
  async updatePassword(
    @Session() session: Request["session"],
    @Param("userId", ParseIntPipe) userId: number,
    @Body() data: UpdatePasswordReq,
  ): Promise<void> {
    if (session.passport?.user.userId != userId) {
      throw new ForbiddenException();
    }
    const { oldPassword, newPassword } = data;
    await this.userService.updateUserPassword(userId, oldPassword, newPassword);
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
