import { Injectable } from "@nestjs/common";

@Injectable()
export class MockTwilioService {
  async sendVerificationEmail(email: string): Promise<void> {
    console.log(`Sending verification email to ${email}`);
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    console.log(`Received verification code for ${email}: ${code}`);
    return true;
  }
}
