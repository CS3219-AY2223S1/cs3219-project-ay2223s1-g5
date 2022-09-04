import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Injectable()
export class MockTwilioService {
  constructor(
    @InjectPinoLogger(MockTwilioService.name)
    private readonly logger: PinoLogger,
  ) {}

  async sendVerificationEmail(email: string): Promise<void> {
    this.logger.info(`Sending verification email to ${email}`);
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    this.logger.info(`Received verification code for ${email}: ${code}`);
    return true;
  }
}
