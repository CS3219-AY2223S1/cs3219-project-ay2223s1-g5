import { Controller, Get, Param, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { SubmissionService } from "./submission.service";

import { GetSubmissionsRes, Submission } from "~shared/types/api";

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
    const submissions = await this.submissionService.getSubmissionsByRoomId(
      roomId,
      userId,
    );

    const submissionsReturnType = {
      submissions: submissions.map((submission) => {
        return {
          submitTime: submission.createdAt.toLocaleDateString("en-US"),
          timeTaken: submission.runTime?.toString(),
          expectedOutput: submission.expectedOutput,
          output: submission.output,
          result: submission.status,
        } as Submission;
      }),
    } as GetSubmissionsRes;

    return submissionsReturnType;
  }
}
