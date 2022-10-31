import { Module } from "@nestjs/common";

import { RedisServiceModule } from "src/core/redis/redis.service.module";
import { QuestionServiceModule } from "src/question/question.service.module";

import { JudgeService } from "./judge.service";

@Module({
  imports: [QuestionServiceModule, RedisServiceModule],
  providers: [JudgeService],
  exports: [JudgeService],
})
export class JudgeServiceModule {}
