import {
  Body,
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

import { UserService } from "./user.service";

import { CreateUserReq, UpdateUserReq } from "~shared/types/api";

@Controller("users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async createUser(@Body() data: CreateUserReq) {
    // TODO: Call verification service
    return this.service.create(data);
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
    return this.service.updateUserDetails(userId, data);
  }
}
