import { Module } from "@nestjs/common";

import { QuestionServiceModule } from "src/question/question.service.module";

import { SubmissionService } from "./submission.service";

@Module({
  imports: [QuestionServiceModule],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionServiceModule {}
