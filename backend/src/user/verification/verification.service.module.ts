import { Module } from "@nestjs/common";

import { TwilioServiceModule } from "src/external/twilio/twilio.service.module";
import { UserServiceModule } from "src/user/user.service.module";

import { VerificationService } from "./verification.service";

@Module({
  imports: [UserServiceModule, TwilioServiceModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationServiceModule {}
