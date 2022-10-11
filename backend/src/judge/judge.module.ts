import { Module } from "@nestjs/common";

import { RoomGateway } from "src/room/room.gateway";
import { RoomServiceModule } from "src/room/room.service.module";

import { JudgeController } from "./judge.controller";
import { JudgeServiceModule } from "./judge.service.module";

@Module({
  imports: [JudgeServiceModule, RoomServiceModule],
  providers: [RoomGateway],
  controllers: [JudgeController],
})
export class JudgeModule {}
