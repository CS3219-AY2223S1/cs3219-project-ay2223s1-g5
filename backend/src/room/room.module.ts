import { Module } from "@nestjs/common";

import { SubmissionServiceModule } from "src/submission/submission.service.module";

import { RoomController } from "./room.controller";
import { RoomGateway } from "./room.gateway";
import { RoomServiceModule } from "./room.service.module";

@Module({
  imports: [RoomServiceModule, SubmissionServiceModule],
  controllers: [RoomController],
  providers: [RoomGateway],
  exports: [RoomGateway],
})
export class RoomModule {}
