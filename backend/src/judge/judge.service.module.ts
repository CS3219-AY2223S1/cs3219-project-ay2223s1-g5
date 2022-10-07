import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";

import { JudgeService } from "./judge.service";

@Module({
  imports: [CoreModule],
  providers: [JudgeService],
  exports: [JudgeService],
})
export class JudgeServiceModule {}
