import { Global, Module } from "@nestjs/common";

import { ConfigServiceModule } from "./config/config.service.module";
import { PrismaServiceModule } from "./prisma/prisma.service.module";
import { RedisServiceModule } from "./redis/redis.service.module";

@Global()
@Module({
  imports: [ConfigServiceModule, PrismaServiceModule, RedisServiceModule],
  exports: [ConfigServiceModule, PrismaServiceModule, RedisServiceModule],
})
export class CoreModule {}
