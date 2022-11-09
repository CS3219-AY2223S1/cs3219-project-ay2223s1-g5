import { Module } from "@nestjs/common";

import { QuestionController } from "./question.controller";
import { QuestionServiceModule } from "./question.service.module";

@Module({
  imports: [QuestionServiceModule],
  controllers: [QuestionController],
})
export class QuestionModule {}
