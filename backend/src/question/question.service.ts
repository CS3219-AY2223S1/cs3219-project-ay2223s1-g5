import { Injectable } from "@nestjs/common";
import { Category, Question, Topic } from "@prisma/client";

import { PrismaService } from "src/core/prisma.service";

import { DifficultyLevel } from "~shared/types/base";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async getQuestionById(id: number): Promise<Question | null> {
    return this.prisma.question.findUnique({
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
  async getIdByDifficulty(
    difficultyLevel: DifficultyLevel,
  ): Promise<number | null> {
    const questionsCount = await this.prisma.question.count({
      where: { difficulty: difficultyLevel },
    });
    const randomNum = Math.floor(Math.random() * questionsCount);
    const question = await this.prisma.question.findFirst({
      take: 1,
      skip: randomNum,
      where: { difficulty: difficultyLevel },
      select: { id: true },
    });
    if (question === null) {
      return 0;
    }
    const { id } = question;
    return id;
  }
}
