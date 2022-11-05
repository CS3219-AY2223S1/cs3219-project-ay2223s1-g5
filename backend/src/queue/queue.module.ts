import { Module } from "@nestjs/common";

import { QueueGateway } from "./queue.gateway";
import { QueueServiceModule } from "./queue.service.module";

@Module({
  imports: [QueueServiceModule],
  providers: [QueueGateway],
})
export class QueueModule {}
