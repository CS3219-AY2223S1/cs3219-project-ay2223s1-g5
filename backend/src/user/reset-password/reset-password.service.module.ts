import { Module } from "@nestjs/common";

import { TwilioServiceModule } from "src/external/twilio/twilio.service.module";
import { UserServiceModule } from "src/user/user.service.module";

import { ResetPasswordService } from "./reset-password.service";

@Module({
  imports: [UserServiceModule, TwilioServiceModule],
  providers: [ResetPasswordService],
  exports: [ResetPasswordService],
})
export class ResetPasswordServiceModule {}
