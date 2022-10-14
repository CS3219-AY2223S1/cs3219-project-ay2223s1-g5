import { Module } from "@nestjs/common";

import { StatisticsController } from "./statistics.controller";
import { StatisticsServiceModule } from "./statistics.service.module";

@Module({
  imports: [StatisticsServiceModule],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
