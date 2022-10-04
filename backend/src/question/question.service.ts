import { Injectable } from "@nestjs/common";
import { Category, Question, Topic } from "@prisma/client";

import { PrismaService } from "src/core/prisma.service";

import { DifficultyLevel } from "../../../shared/src/types/base";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async getQuestionById(id: number): Promise<Question | null> {
    return this.prisma.question.findFirst({
      where: { id: id },
    });
  }

  async getTopicsByQuestionId(id: number): Promise<Topic[] | null> {
    return this.prisma.topic.findMany({
      include: {
        questions: {
          where: {
            id: id,
          },
        },
      },
    });
  }

  async getCategoryByQuestionId(id: number): Promise<Category | null> {
    return this.prisma.category.findFirst({
      include: {
        questions: {
          where: {
            id: id,
          },
        },
      },
    });
  }

  // gets a random question number of diffiulty difficultyLevel
  async getIdByDifficulty(difficultyLevel: DifficultyLevel): Promise<number> {
    const questionsCount = await this.prisma.question.count({
      where: { difficulty: difficultyLevel },
    });
    const randomQuestionId = Math.floor(Math.random() * questionsCount); // 0 if no questions
    return randomQuestionId;
  }
}
