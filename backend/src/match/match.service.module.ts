import { Module } from "@nestjs/common";

import { RoomServiceModule } from "src/room/room.service.module";

import { MatchService } from "./match.service";

@Module({
  imports: [RoomServiceModule],
  providers: [MatchService],
  exports: [MatchService],
})
export class MatchServiceModule {}
