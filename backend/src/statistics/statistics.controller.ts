import { Controller, Get, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { StatisticsService } from "./statistics.service";

import { UserStatisticsRes } from "~shared/types/api";

@Controller("user/statistics")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @UseGuards(SessionGuard)
  @Get()
  async getStatistics(
    @Session() session: Request["session"],
  ): Promise<UserStatisticsRes> {
    return this.statisticsService.getByUserId(
      session.passport?.user.userId || NaN,
    );
  }
}
