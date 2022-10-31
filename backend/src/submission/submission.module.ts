import { Module } from "@nestjs/common";

import { RoomModule } from "src/room/room.module";

import { SubmissionCallbackController } from "./submission.callback.controller";
import { SubmissionController } from "./submission.controller";
import { SubmissionServiceModule } from "./submission.service.module";

@Module({
  imports: [SubmissionServiceModule, RoomModule],
  controllers: [SubmissionController, SubmissionCallbackController],
})
export class SubmissionModule {}
