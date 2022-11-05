import { Module } from "@nestjs/common";

import { QuestionService } from "./question.service";

@Module({
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionServiceModule {}
