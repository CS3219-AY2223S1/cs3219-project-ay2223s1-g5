import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/core/prisma.service";

import { Difficulty } from "~shared/types/base";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async getQuestionById(id: number) {
    return this.prisma.question.findUnique({
      where: { id: id },
      include: {
        topics: true,
        category: true,
      },
    });
  }

  // gets a random question number of difficulty
  async getIdByDifficulty(difficulty: Difficulty): Promise<number | null> {
    const questionsCount = await this.prisma.question.count({
      where: { difficulty },
    });
    const randomNum = Math.floor(Math.random() * questionsCount);
    const question = await this.prisma.question.findFirst({
      take: 1,
      skip: randomNum,
      where: { difficulty },
      select: { id: true },
    });
    if (question === null) {
      return 0;
    }
    const { id } = question;
    return id;
  }
}
