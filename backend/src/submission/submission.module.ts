import { Module } from "@nestjs/common";

import { QuestionServiceModule } from "src/question/question.service.module";

import { SubmissionController } from "./submission.controller";
import { SubmissionServiceModule } from "./submission.service.module";

@Module({
  imports: [SubmissionServiceModule, QuestionServiceModule],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
