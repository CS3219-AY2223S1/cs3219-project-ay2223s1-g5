import { Module } from "@nestjs/common";

import { SubmissionController } from "./submission.controller";
import { SubmissionServiceModule } from "./submission.service.module";

@Module({
  imports: [SubmissionServiceModule],
  controllers: [SubmissionController],
})
export class SubmissionModule {}
