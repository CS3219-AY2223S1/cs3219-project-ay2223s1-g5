import { Module } from "@nestjs/common";

import { RedisServiceModule } from "src/redis/redis.service.module";
import { RoomServiceModule } from "src/room/room.service.module";

import { MatchService } from "./match.service";

@Module({
  imports: [RedisServiceModule, RoomServiceModule],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchServiceModule {}
