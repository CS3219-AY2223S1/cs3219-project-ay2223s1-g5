import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { MatchGateway } from "./match.gateway";
import { MatchServiceModule } from "./match.service.module";

@Module({
  imports: [MatchServiceModule, CoreModule],
  providers: [MatchGateway],
})
export class MatchModule {}
