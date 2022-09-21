import { Module } from "@nestjs/common";

import { RoomServiceModule } from "src/room/room.service.module";

import { QueueService } from "./queue.service";

@Module({
  imports: [RoomServiceModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueServiceModule {}
