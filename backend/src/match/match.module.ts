import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";
import { RoomServiceModule } from "src/room/room.service.module";

import { MatchGateway } from "./match.gateway";
import { MatchServiceModule } from "./match.service.module";

@Module({
  imports: [MatchServiceModule, CoreModule, RoomServiceModule],
  providers: [MatchGateway],
})
export class MatchModule {}
