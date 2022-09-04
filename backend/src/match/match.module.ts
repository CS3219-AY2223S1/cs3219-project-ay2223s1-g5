import { Module } from "@nestjs/common";
import { MatchController } from "./match.controller";
import { MatchServiceModule } from "./match.service.module";

@Module({
  imports: [MatchServiceModule],
  controllers: [MatchController],
})
export class MatchModule {}
