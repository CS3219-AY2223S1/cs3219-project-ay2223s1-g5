import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";
import { RoomServiceModule } from "src/room/room.service.module";

import { QueueGateway } from "./queue.gateway";
import { QueueServiceModule } from "./queue.service.module";

@Module({
  imports: [QueueServiceModule, CoreModule, RoomServiceModule],
  providers: [QueueGateway],
})
export class QueueModule {}
