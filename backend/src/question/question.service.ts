import { Injectable } from "@nestjs/common";
import { Question } from "@prisma/client";

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

  // gets a random question number of diffiulty difficultyLevel
  async getIdByDifficulty(difficultyLevel: DifficultyLevel): Promise<number> {
    const questionsCount = await this.prisma.question.count({
      where: { difficulty: difficultyLevel },
    });
    const randomQuestionId = Math.floor(Math.random() * questionsCount); // 0 if no questions
    return randomQuestionId;
  }
}
