import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";
import { JudgeServiceModule } from "src/judge/judge.service.module";

import { RoomController } from "./room.controller";
import { RoomGateway } from "./room.gateway";
import { RoomServiceModule } from "./room.service.module";

@Module({
  imports: [RoomServiceModule, CoreModule, JudgeServiceModule],
  controllers: [RoomController],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class RoomModule {}
