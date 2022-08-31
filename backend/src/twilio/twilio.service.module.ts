import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { TwilioService } from "./twilio.service";

@Module({
  imports: [CoreModule],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioServiceModule {}
