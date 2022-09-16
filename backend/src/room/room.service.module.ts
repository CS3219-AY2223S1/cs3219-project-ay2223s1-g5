import { Module } from "@nestjs/common";

import { RedisServiceModule } from "src/redis/redis.service.module";

import { RoomService } from "./room.service";

@Module({
  imports: [RedisServiceModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomServiceModule {}
