import { Module } from "@nestjs/common";

import { VerificationServiceModule } from "src/verification/verification.service.module";

import { ResetPasswordServiceModule } from "./reset-password.service.module";
import { UserController } from "./user.controller";
import { UserServiceModule } from "./user.service.module";

@Module({
  imports: [
    UserServiceModule,
    VerificationServiceModule,
    ResetPasswordServiceModule,
  ],
  controllers: [UserController],
})
export class UserModule {}
