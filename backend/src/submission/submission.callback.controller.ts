import { Body, Controller, Put } from "@nestjs/common";

import { RoomGateway } from "src/room/room.gateway";

import { SubmissionService } from "./submission.service";

@Controller("submissions")
export class SubmissionCallbackController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly roomGateway: RoomGateway,
  ) {}

  @Put("callback")
  async callback(@Body() response: unknown): Promise<void> {
    const completed = await this.submissionService.handleCallback(response);
    if (!completed) {
      return;
    }
    const { roomId, submissionId } = completed;
    this.roomGateway.handleSubmissionUpdate(roomId, submissionId);
  }
}
