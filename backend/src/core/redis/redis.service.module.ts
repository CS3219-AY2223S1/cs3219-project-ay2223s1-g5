import { Module } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";
import { ConfigServiceModule } from "src/core/config/config.service.module";

import { RedisService } from "./redis.service";

@Module({
  imports: [ConfigServiceModule],
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
