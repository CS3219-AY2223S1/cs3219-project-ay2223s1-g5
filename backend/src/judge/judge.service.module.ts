import { Module } from "@nestjs/common";

import { CoreModule } from "src/core/core.module";
import { RedisServiceModule } from "src/core/redis/redis.service.module";
import { QuestionServiceModule } from "src/question/question.service.module";

import { JudgeService } from "./judge.service";

@Module({
  imports: [CoreModule, QuestionServiceModule, RedisServiceModule],
  providers: [JudgeService],
  exports: [JudgeService],
})
export class JudgeServiceModule {}
