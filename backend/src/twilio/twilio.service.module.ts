import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { MockTwilioService } from "./mock.twilio.service";
import { TwilioService } from "./twilio.service";

@Module({
  imports:
    process.env.NODE_ENV === "development"
      ? [CoreModule, RedisServiceModule]
      : [CoreModule],
  providers: [
    {
      provide: TwilioService,
      useClass:
        process.env.NODE_ENV === "development"
          ? MockTwilioService
          : TwilioService,
    },
  ],
  exports: [TwilioService],
})
export class TwilioServiceModule {}
