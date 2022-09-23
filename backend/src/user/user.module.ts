import { Module } from "@nestjs/common";

import { ResetPasswordServiceModule } from "./reset-password/reset-password.service.module";
import { VerificationServiceModule } from "./verification/verification.service.module";
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
