import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserReq, UpdateUserReq } from "~shared/types/api";

@Controller("/users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async createUser(@Body() data: CreateUserReq) {
    // TODO: Call verification service
    return this.service.create(data);
  }

  @Put(":userId(\\d+)")
  async updateUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() data: UpdateUserReq,
  ) {
    return this.service.updateUserDetails(userId, data);
  }
}
