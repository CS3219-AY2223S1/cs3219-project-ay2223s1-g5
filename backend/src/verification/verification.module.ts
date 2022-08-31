import { Module } from "@nestjs/common";

import { VerificationController } from "./verification.controller";
import { VerificationServiceModule } from "./verification.service.module";

@Module({
  imports: [VerificationServiceModule],
  controllers: [VerificationController],
})
export class VerificationModule {}
