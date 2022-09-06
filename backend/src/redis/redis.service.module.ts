import { Module } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";
import { CoreModule } from "src/core/core.module";

import { RedisService } from "./redis.service";

@Module({
  imports: [CoreModule],
  providers: [
    {
      inject: [PinoLogger, ConfigService],
      provide: RedisService,
      useFactory: RedisService.create,
    },
  ],
  exports: [RedisService],
})
export class RedisServiceModule {}
