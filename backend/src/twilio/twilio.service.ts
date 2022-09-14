import { Injectable } from "@nestjs/common";
import twilio from "twilio";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;
  private domain: string;
  private verificationSid: string;
  private resetPasswordSid: string;

  constructor(private configService: ConfigService) {
    this.twilioClient = twilio(
      configService.get("twilio.accountSid"),
      configService.get("twilio.authToken"),
    );
    this.domain = configService.get("domain");
    this.verificationSid = configService.get("twilio.verificationSid");
    this.resetPasswordSid = configService.get("twilio.resetPasswordSid");
  }

  async sendVerificationEmail(email: string, userId: number): Promise<void> {
    await this.twilioClient.verify
      .services(this.verificationSid)
      .verifications.create({
        channelConfiguration: {
          substitutions: {
            domain: this.domain,
            user_id: userId.toString(),
          },
        },
        to: email,
        channel: "email",
      });
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    try {
      const result = await this.twilioClient.verify
        .services(this.verificationSid)
        .verificationChecks.create({ to: email, code: code });
      return result.status === "approved";
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }
      if (!Object.prototype.hasOwnProperty.call(e, "status")) {
        throw e;
      }
      const error = e as unknown as { status: number };
      if (error.status === 404) {
        // See possible reasons at: https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
        return false;
      }
      throw e;
    }
  }

  async sendResetPasswordEmail(
    email: string,
    userId: number,
    name: string,
  ): Promise<void> {
    await this.twilioClient.verify
      .services(this.resetPasswordSid)
      .verifications.create({
        channelConfiguration: {
          substitutions: {
            domain: this.domain,
            user_id: userId.toString(),
            name: name,
          },
        },
        to: email,
        channel: "email",
      });
  }

  async verifyResetPasswordCode(email: string, code: string): Promise<boolean> {
    try {
      const result = await this.twilioClient.verify
        .services(this.resetPasswordSid)
        .verificationChecks.create({ to: email, code: code });
      return result.status === "approved";
    } catch (e: unknown) {
      if (!(e instanceof Error)) {
        throw e;
      }
      if (!Object.prototype.hasOwnProperty.call(e, "status")) {
        throw e;
      }
      const error = e as unknown as { status: number };
      if (error.status === 404) {
        // See possible reasons at: https://www.twilio.com/docs/verify/api/verification-check#check-a-verification
        return false;
      }
      throw e;
    }
  }
}
