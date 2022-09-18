import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { RoomGateway } from "./room.gateway";
import { RoomServiceModule } from "./room.service.module";

@Module({
  imports: [RoomServiceModule, CoreModule],
  providers: [RoomGateway],
})
export class RoomModule {}
