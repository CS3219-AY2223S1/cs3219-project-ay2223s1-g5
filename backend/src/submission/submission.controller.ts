import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from "@nestjs/common";

import { SessionGuard } from "src/auth/session.guard";

import { SubmissionService } from "./submission.service";

import { GetSubmissionsRes, Submission } from "~shared/types/api";

@Controller("room/:roomId(\\w+)/submissions")
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

  @UseGuards(SessionGuard)
  @Get()
  async getSubmissions(
    @Param("roomId") roomId: string,
  ): Promise<GetSubmissionsRes | null> {
    const submissions = await this.submissionService.getSubmissionsByRoomId(
      roomId,
    );
    if (submissions == null) {
      throw new NotFoundException("Submissions not found.");
    }

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
