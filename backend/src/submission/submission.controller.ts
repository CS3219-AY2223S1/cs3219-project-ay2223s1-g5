import { Controller, Get, Param, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { SubmissionService } from "./submission.service";

import { GetSubmissionsRes } from "~shared/types/api";

@Controller("room/:roomId(\\w+)/submissions")
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

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
    const testCase = await this.submissionService.getTestCaseByQuestionId(
      roomSession.questionId,
    );

    const submissionsReturnType = {
      submissions: submissions.map((submission) => {
        return {
          submitTime: submission.createdAt,
          timeTaken: submission.runTime || NaN,
          inputs: testCase?.inputs || [],
          expectedOutput: testCase?.output || "",
          output: submission.output || "",
          result: submission.status,
        };
      }),
    };

    return submissionsReturnType;
  }
}
