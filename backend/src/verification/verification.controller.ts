import {
  Body,
  ConflictException,
  Controller,
  Patch,
  Post,
  UnauthorizedException,
} from "@nestjs/common";

import { VerificationError } from "src/common/errors/verification.error";

import { VerificationService } from "./verification.service";

@Controller("/users/verifications")
export class VerificationController {
  constructor(private service: VerificationService) {}

  @Post()
  async resendVerificationEmail(
    @Body() { email }: { email: string },
  ): Promise<void> {
    try {
      return await this.service.sendVerificationEmail(email);
    } catch (e: unknown) {
      if (!(e instanceof VerificationError)) {
        throw e;
      }
      throw new ConflictException(e.message);
    }
  }

  @Patch()
  async checkVerificationCode(
    @Body() { email, code }: { email: string; code: string },
  ): Promise<void> {
    const result = this.service.checkVerificationCode(email, code);
    if (!result) {
      throw new UnauthorizedException("Failed to verify user email.");
    }
  }
}
