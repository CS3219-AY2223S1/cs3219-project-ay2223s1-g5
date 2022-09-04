import { Module } from "@nestjs/common";

import { JwtAuthGuard } from "src/auth/jwt.guard";

import { UserController } from "./user.controller";
import { UserServiceModule } from "./user.service.module";

@Module({
  imports: [UserServiceModule],
  providers: [JwtAuthGuard],
  controllers: [UserController],
})
export class UserModule {}
