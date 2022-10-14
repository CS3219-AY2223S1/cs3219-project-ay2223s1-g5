import { Controller, Get, Param, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";
import { QuestionService } from "src/question/question.service";

import { SubmissionService } from "./submission.service";

import { GetSubmissionsRes, Submission } from "~shared/types/api";

@Controller("room/:roomId(\\w+)/submissions")
export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private questionService: QuestionService,
  ) {}

  @UseGuards(SessionGuard)
  @Get()
  async getSubmissions(
    @Session() session: Request["session"],
    @Param("roomId") roomId: string,
  ): Promise<GetSubmissionsRes | null> {
    const userId = Number(session.passport?.user.userId);
    const roomSession = await this.submissionService.getSessionByRoomId(
      roomId,
      userId,
    );

    const submissions = roomSession.submissions;
    const testCase = await this.questionService.getTestcase(
      roomSession.questionId,
    );

    const submissionsReturnType = {
      submissions: submissions.map((submission) => {
        return {
          submitTime: submission.createdAt,
          timeTaken: submission.runTime,
          inputs: testCase?.inputs,
          expectedOutput: testCase?.output,
          output: submission.output,
          result: submission.status,
        } as Submission;
      }),
    } as GetSubmissionsRes;

    return submissionsReturnType;
  }
}
