import { Injectable } from "@nestjs/common";
import twilio from "twilio";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;
  private verificationSid: string;

  constructor(private configService: ConfigService) {
    this.twilioClient = twilio(
      configService.get("twilio.accountSid"),
      configService.get("twilio.authToken"),
    );
    this.verificationSid = configService.get("twilio.verificationSid");
  }

  async sendVerificationEmail(email: string) {
    return this.twilioClient.verify
      .services(this.verificationSid)
      .verifications.create({
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
}
