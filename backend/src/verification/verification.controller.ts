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

import { VerifyEmailReq } from "~shared/types/api";

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
    @Body() { userId, code }: VerifyEmailReq,
  ): Promise<void> {
    const result = await this.service.checkVerificationCode(userId, code);
    if (!result) {
      throw new UnauthorizedException("Failed to verify user email.");
    }
  }
}
