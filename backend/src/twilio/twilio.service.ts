import { Injectable } from "@nestjs/common";
import twilio from "twilio";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;
  private domain: string;
  private verificationSid: string;
  private resetPasswordSid: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioClient = twilio(
      this.configService.get("twilio.accountSid"),
      this.configService.get("twilio.authToken"),
    );
    this.domain = this.configService.get("domain");
    this.verificationSid = this.configService.get("twilio.verificationSid");
    this.resetPasswordSid = this.configService.get("twilio.resetPasswordSid");
  }

  async sendVerificationEmail(email: string, userId: number): Promise<void> {
    const substitutions = {
      domain: this.domain,
      user_id: userId.toString(),
    };
    await this.createVerification(this.verificationSid, email, substitutions);
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    return await this.verificationCheck(this.verificationSid, email, code);
  }

  async sendResetPasswordEmail(
    email: string,
    userId: number,
    name: string,
  ): Promise<void> {
    const substitutions = {
      domain: this.domain,
      user_id: userId.toString(),
      name: name,
    };
    await this.createVerification(this.resetPasswordSid, email, substitutions);
  }

  async verifyResetPasswordCode(email: string, code: string): Promise<boolean> {
    return await this.verificationCheck(this.resetPasswordSid, email, code);
  }

  private async createVerification(
    sid: string,
    email: string,
    substitutions: Record<string, string>,
  ): Promise<void> {
    await this.twilioClient.verify.services(sid).verifications.create({
      channelConfiguration: {
        substitutions,
      },
      to: email,
      channel: "email",
    });
  }

  private async verificationCheck(
    sid: string,
    email: string,
    code: string,
  ): Promise<boolean> {
    try {
      const result = await this.twilioClient.verify
        .services(sid)
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
