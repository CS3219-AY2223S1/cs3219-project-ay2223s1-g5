import { Module } from "@nestjs/common";

import { JwtAuthGuard } from "src/auth/jwt.guard";
import { VerificationServiceModule } from "src/verification/verification.service.module";

import { UserController } from "./user.controller";
import { UserServiceModule } from "./user.service.module";

@Module({
  imports: [UserServiceModule, VerificationServiceModule],
  providers: [JwtAuthGuard],
  controllers: [UserController],
})
export class UserModule {}
