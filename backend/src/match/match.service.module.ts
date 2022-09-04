import { Module } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { MatchService } from "./match.service";

@Module({
  providers: [MatchService, RedisService],
  exports: [MatchService],
})
export class MatchServiceModule {}
