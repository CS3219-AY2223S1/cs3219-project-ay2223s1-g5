import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserReq } from "~shared/types/api";

@Controller("/users")
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post()
  async signUp(@Body() data: CreateUserReq) {
    return this.service.create(data);
  }
}
