import { Body, Controller, Put } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RoomGateway } from "src/room/room.gateway";

import { JudgeService } from "./judge.service";

import { Judge0Callback } from "~shared/types/api";

@Controller("judge")
export class JudgeController {
  constructor(
    @InjectPinoLogger(JudgeController.name)
    private readonly logger: PinoLogger,
    private readonly judgeService: JudgeService,
    private readonly roomGateway: RoomGateway,
  ) {}

  @Put("callback")
  async callback(
    @Body() response: Pick<Judge0Callback, "token">,
  ): Promise<void> {
    const { roomId, submissionId } = await this.judgeService.handleCallback(
      response,
    );
    this.roomGateway.handleSubmissionUpdate(roomId, submissionId);
    return;
  }
}
