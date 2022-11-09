import { Controller, Get, Param, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { SubmissionService } from "./submission.service";

import { GetSubmissionsRes } from "~shared/types/api";
import { Status } from "~shared/types/base";

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
    const { questionId, submissions } =
      await this.submissionService.getSubmissionsByRoomId(roomId, userId);

    const testCase = await this.submissionService.getTestCaseByQuestionId(
      questionId,
    );

    const submissionsReturnType = {
      submissions: submissions.map((submission) => {
        return {
          submitTime: submission.createdAt,
          status: submission.status as Status,
          code: submission.code,
          runTime: submission.runTime ?? undefined,
          memoryUsage: submission.memoryUsage ?? undefined,
          inputs: testCase?.inputs || [],
          expectedOutput: testCase?.output || "",
          standardOutput: submission.output ?? undefined,
          errorOutput: submission.errorOutput ?? undefined,
          compileOutput: submission.compileOutput ?? undefined,
        };
      }),
    };

    return submissionsReturnType;
  }
}
