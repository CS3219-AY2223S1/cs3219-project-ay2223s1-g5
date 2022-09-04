import { Module } from "@nestjs/common";
import { RedisServiceModule } from "src/redis/redis.service.module";
import { MatchService } from "./match.service";

@Module({
  imports: [RedisServiceModule],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchServiceModule {}
