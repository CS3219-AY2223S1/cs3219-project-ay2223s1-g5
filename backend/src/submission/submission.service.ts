import { Injectable } from "@nestjs/common";

import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { PrismaService } from "src/core/prisma/prisma.service";
import { QuestionService } from "src/question/question.service";

@Injectable()
export class SubmissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionService: QuestionService,
  ) {}

  async getSessionByRoomId(roomId: string, userId: number) {
    const roomSession = await this.prisma.roomSession.findFirst({
      where: { id: roomId, users: { some: { id: userId } } },
      include: {
        submissions: true,
      },
    });

    if (!roomSession) {
      throw new EntityNotFoundError("Room session not found.");
    }

    return roomSession;
  }

  async getTestCaseByQuestionId(questionId: number) {
    return await this.questionService.getTestcase(questionId);
  }
}
