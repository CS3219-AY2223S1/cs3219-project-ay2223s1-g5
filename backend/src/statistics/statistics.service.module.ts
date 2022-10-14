import { Module } from "@nestjs/common";

import { StatisticsService } from "./statistics.service";

@Module({
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsServiceModule {}
