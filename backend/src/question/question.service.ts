import { Injectable } from "@nestjs/common";
import { Language as PrismaLanguage } from "@prisma/client";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { InternalServerError } from "src/common/errors/internal-server.error";
import { PrismaService } from "src/core/prisma.service";

import { Difficulty, Language } from "~shared/types/base";

@Injectable()
export class QuestionService {
  constructor(
    @InjectPinoLogger(QuestionService.name)
    private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
  ) {}

  async getQuestionById(id: number) {
    return this.prisma.question.findUnique({
      where: { id: id },
      include: {
        topics: true,
        category: true,
      },
    });
  }

  async getSolutionTemplateByLanguage(questionId: number, language: Language) {
    return this.prisma.solutionTemplate.findFirst({
      where: {
        questionId,
        language: language.toUpperCase() as PrismaLanguage,
      },
    });
  }

  async getTestcase(questionId: number) {
    return this.prisma.testCase.findFirst({
      where: {
        questionId,
      },
    });
  }

  // gets a random question number of difficulty
  async getIdByDifficulty(difficulty: Difficulty): Promise<number> {
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
      this.logger.error(`Unable to load question.`);
      throw new InternalServerError();
    }
    const { id } = question;
    return id;
  }
}
