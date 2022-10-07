import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { QueueGateway } from "./queue.gateway";
import { QueueServiceModule } from "./queue.service.module";

@Module({
  imports: [QueueServiceModule, CoreModule],
  providers: [QueueGateway],
})
export class QueueModule {}
