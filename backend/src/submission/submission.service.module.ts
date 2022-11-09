import { Module } from "@nestjs/common";

import { JudgeServiceModule } from "src/external/judge/judge.service.module";
import { QuestionServiceModule } from "src/question/question.service.module";

import { SubmissionService } from "./submission.service";

@Module({
  imports: [QuestionServiceModule, JudgeServiceModule],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionServiceModule {}
