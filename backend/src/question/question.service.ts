import { Injectable } from "@nestjs/common";
import { Difficulty, Question } from "@prisma/client";

import { PrismaService } from "src/core/prisma.service";

import { DifficultyLevel } from "../../../shared/src/types/base";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  // gets a random question of diffiulty difficultyLevel
  async getByDifficulty(
    difficultyLevel: DifficultyLevel,
  ): Promise<Question | null> {
    const difficulty: Difficulty = difficultyLevel;
    const questionsCount = await this.prisma.question.count({
      where: { difficulty: difficulty },
    });
    const randomNum = Math.floor(Math.random() * questionsCount);
    return this.prisma.question.findFirst({
      take: 1,
      skip: randomNum,
      where: { difficulty: difficulty },
    });
  }
}
