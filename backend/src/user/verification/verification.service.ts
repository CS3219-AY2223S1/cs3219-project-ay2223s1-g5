import { Injectable } from "@nestjs/common";

import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { VerificationError } from "src/common/errors/verification.error";
import { TwilioService } from "src/external/twilio/twilio.service";

import { UserService } from "../user.service";

@Injectable()
export class VerificationService {
  constructor(
    private userService: UserService,
    private twilioService: TwilioService,
  ) {}

  async sendVerificationEmail(email: string) {
    const user = await this.userService.getByEmail(email.toLowerCase());
    if (!user) {
      throw new EntityNotFoundError("User not found.");
    }
    if (user.verified) {
      throw new VerificationError("User already verified.");
    }
    await this.twilioService.sendVerificationEmail(user.email, user.id);
  }

  async checkVerificationCode(userId: number, code: string): Promise<boolean> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new EntityNotFoundError("User not found.");
    }
    if (user.verified) {
      return true;
    }
    const result = await this.twilioService.verifyEmailCode(user.email, code);
    if (!result) {
      return false;
    }
    await this.userService.updateUserVerification(user.id);
    return true;
  }
}
