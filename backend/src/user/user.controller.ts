import {
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Request,
  Response,
  UseGuards,
} from "@nestjs/common";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

import { JwtAuthGuard } from "src/auth/jwt.guard";
import { VerificationService } from "src/verification/verification.service";

import { UserService } from "./user.service";

import {
  CreateUserReq,
  GetUserNameRes,
  UpdateUserReq,
} from "~shared/types/api";

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

  @UseGuards(JwtAuthGuard)
  @Get(":userId(\\d+)")
  async getUserName(
    @Request() req: ExpressRequest,
    @Response() res: ExpressResponse,
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<GetUserNameRes | null> {
    const User = await this.userService.getNameById(userId);
    const responseBody: GetUserNameRes = {
      name: User?.name ?? "",
    };

    res.json(responseBody);
    return responseBody;
  }
}
