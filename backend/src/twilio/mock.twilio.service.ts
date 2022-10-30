import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";
import { RedisService } from "src/redis/redis.service";

@Injectable()
export class MockTwilioService {
  private static readonly NAMESPACE = "TWILIO";
  private static readonly VERIFICATION_NAMESPACE = "VERIFY";
  private static readonly RESET_PASSWORD_NAMESPACE = "RESET";
  private domain: string;

  constructor(
    @InjectPinoLogger(MockTwilioService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.domain = this.configService.get("domain");
  }

  createConversationsToken(_identity: string, _room: string): string {
    return "MOCK_CONVERSATION_TOKEN";
  }

  async createChatRoom(roomId: string): Promise<string> {
    const chatRoomSid = nanoid(10);
    this.logger.info(`Creating chat room: ${roomId} (${chatRoomSid})`);
    return chatRoomSid;
  }

  async joinChatRoom(
    chatRoomSid: string,
    userIdentity: string,
  ): Promise<string> {
    const participantSid = nanoid(10);
    this.logger.info(
      `Joining chat room [${chatRoomSid}]: ${userIdentity} (${participantSid})`,
    );
    return participantSid;
  }

  async leaveChatRoom(
    chatRoomSid: string,
    participantSid: string,
  ): Promise<void> {
    this.logger.info(`Leaving chat room [${chatRoomSid}]: ${participantSid}`);
  }

  async closeChatRoom(chatRoomSid: string): Promise<void> {
    this.logger.info(`Creating chat room: ${chatRoomSid}`);
  }

  async sendSystemMessage(chatRoomSid: string, message: string): Promise<void> {
    this.logger.info(`Sending system message [${chatRoomSid}] ${message}`);
  }

  async sendVerificationEmail(email: string, userId: number): Promise<void> {
    const code = nanoid(10);
    // Code expires in 10 minutes
    await this.redisService.setKey(
      [MockTwilioService.NAMESPACE, MockTwilioService.VERIFICATION_NAMESPACE],
      email,
      code,
      600,
    );
    this.logger.info(
      `Sending verification email to ${email}: ${this.domain}/verify?code=${code}&userId=${userId}`,
    );
  }

  async verifyEmailCode(email: string, code: string): Promise<boolean> {
    this.logger.info(`Received verification code for ${email}: ${code}`);
    const expected = await this.redisService.getValue(
      [MockTwilioService.NAMESPACE, MockTwilioService.VERIFICATION_NAMESPACE],
      email,
    );
    if (!!expected && expected === code) {
      await this.redisService.deleteKey(
        [
          MockTwilioService.NAMESPACE,
          MockTwilioService.RESET_PASSWORD_NAMESPACE,
        ],
        email,
      );
      return true;
    }
    return false;
  }

  async sendResetPasswordEmail(
    email: string,
    userId: number,
    _: string,
  ): Promise<void> {
    const code = nanoid(10);
    // Code expires in 10 minutes
    await this.redisService.setKey(
      [MockTwilioService.NAMESPACE, MockTwilioService.RESET_PASSWORD_NAMESPACE],
      email,
      code,
      600,
    );
    this.logger.info(
      `Sending reset password email to ${email}: ${this.domain}/reset-password?code=${code}&userId=${userId}`,
    );
  }

  async verifyResetPasswordCode(email: string, code: string): Promise<boolean> {
    this.logger.info(`Received reset email code for ${email}: ${code}`);
    const expected = await this.redisService.getValue(
      [MockTwilioService.NAMESPACE, MockTwilioService.RESET_PASSWORD_NAMESPACE],
      email,
    );
    if (!!expected && expected === code) {
      await this.redisService.deleteKey(
        [
          MockTwilioService.NAMESPACE,
          MockTwilioService.RESET_PASSWORD_NAMESPACE,
        ],
        email,
      );
      return true;
    }
    return false;
  }
}
