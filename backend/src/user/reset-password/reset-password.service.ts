import { Injectable } from "@nestjs/common";

import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { UnauthorizedError } from "src/common/errors/unauthorized.error";
import { TwilioService } from "src/external/twilio/twilio.service";

import { UserService } from "../user.service";

@Injectable()
export class ResetPasswordService {
  constructor(
    private userService: UserService,
    private twilioService: TwilioService,
  ) {}

  async sendResetPasswordEmail(email: string) {
    const user = await this.userService.getByEmail(email.toLowerCase());
    if (!user) {
      throw new EntityNotFoundError("User not found.");
    }
    return this.twilioService.sendResetPasswordEmail(
      user.email,
      user.id,
      user.name,
    );
  }

  async resetPassword(
    userId: number,
    code: string,
    password: string,
  ): Promise<void> {
    const user = await this.userService.getById(userId);
    if (!user) {
      throw new EntityNotFoundError("User not found.");
    }
    const result = await this.twilioService.verifyResetPasswordCode(
      user.email,
      code,
    );
    if (!result) {
      throw new UnauthorizedError("Invalid or expired code.");
    }
    await this.userService.resetUserPassword(userId, password);
  }
}
