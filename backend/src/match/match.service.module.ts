import { Module } from "@nestjs/common";

import { RedisServiceModule } from "src/redis/redis.service.module";
import { UserServiceModule } from "src/user/user.service.module";

import { MatchService } from "./match.service";

@Module({
  imports: [RedisServiceModule, UserServiceModule],
  providers: [MatchService, UserServiceModule],
  exports: [MatchService],
})
export class MatchServiceModule {}
