import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";

import { SessionGuard } from "src/auth/session.guard";

import { QuestionService } from "./question.service";

import { GetQuestionRes } from "~shared/types/api";

@Controller("questions")
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @UseGuards(SessionGuard)
  @Get(":questionId(\\d+)")
  async getQuestion(
    @Param("questionId", ParseIntPipe) questionId: number,
  ): Promise<GetQuestionRes | null> {
    const question = await this.questionService.getQuestionById(questionId);
    if (!question) {
      throw new NotFoundException("Question not found.");
    }
    const questionReturnType: GetQuestionRes = {
      title: question.title,
      category: question.category.title,
      topics: question.topics.flatMap((topic) => topic.name),
      description: question.description,
      hints: question.hints,
    };
    return questionReturnType;
  }
}
