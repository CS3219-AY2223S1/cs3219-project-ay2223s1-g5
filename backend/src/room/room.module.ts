import { Module } from "@nestjs/common";

import { JudgeServiceModule } from "src/judge/judge.service.module";

import { RoomController } from "./room.controller";
import { RoomGateway } from "./room.gateway";
import { RoomServiceModule } from "./room.service.module";

@Module({
  imports: [RoomServiceModule, JudgeServiceModule],
  controllers: [RoomController],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class RoomModule {}
