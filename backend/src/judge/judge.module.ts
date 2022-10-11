import { Module } from "@nestjs/common";

import { RoomModule } from "src/room/room.module";
import { RoomServiceModule } from "src/room/room.service.module";

import { JudgeController } from "./judge.controller";
import { JudgeServiceModule } from "./judge.service.module";

@Module({
  imports: [JudgeServiceModule, RoomServiceModule, RoomModule],
  controllers: [JudgeController],
})
export class JudgeModule {}
