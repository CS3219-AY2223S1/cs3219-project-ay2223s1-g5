import { Injectable } from "@nestjs/common";

import { TwilioService } from "src/twilio/twilio.service";

import { UserService } from "../user/user.service";

@Injectable()
export class VerificationService {
  constructor(
    private userService: UserService,
    private twilioService: TwilioService,
  ) {}

  async sendVerificationEmail(email: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new Error();
    }
    if (user.verified) {
      throw new Error();
    }
    return this.twilioService.sendVerificationEmail(email);
  }

  async checkVerificationCode(email: string, code: string) {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new Error();
    }
    if (user.verified) {
      return true;
    }
    const result = await this.twilioService.verifyEmailCode(email, code);
    if (!result) {
      // TODO: Handle failed verification.
      throw new Error();
    }
    return await this.userService.updateUserVerification(user.id);
  }
}
