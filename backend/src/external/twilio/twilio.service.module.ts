import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { MockTwilioService } from "./mock.twilio.service";
import { TwilioService } from "./twilio.service";

@Module({
  imports: [CoreModule],
  providers: [
    {
      provide: TwilioService,
      useClass:
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
          ? MockTwilioService
          : TwilioService,
    },
  ],
  exports: [TwilioService],
})
export class TwilioServiceModule {}
