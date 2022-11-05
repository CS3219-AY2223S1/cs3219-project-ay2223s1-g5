import { Injectable } from "@nestjs/common";
import twilio from "twilio";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class TwilioService {
  private twilioClient: twilio.Twilio;
  private domain: string;
  private accountSid: string;
  private verificationSid: string;
  private resetPasswordSid: string;
  private conversationSid: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.twilioClient = twilio(
      this.configService.get("twilio.accountSid"),
      this.configService.get("twilio.authToken"),
    );
    this.domain = this.configService.get("domain");
    this.accountSid = this.configService.get("twilio.accountSid");
    this.verificationSid = this.configService.get("twilio.verificationSid");
    this.resetPasswordSid = this.configService.get("twilio.resetPasswordSid");
    this.conversationSid = this.configService.get("twilio.conversationsSid");
    this.apiKey = this.configService.get("twilio.apiKey");
    this.apiSecret = this.configService.get("twilio.apiSecret");
  }

  createChatToken(userIdentity: string, roomId: string): string {
    const chatGrant = new twilio.jwt.AccessToken.ChatGrant({
      serviceSid: this.conversationSid,
    });
    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: roomId,
    });
    const token = new twilio.jwt.AccessToken(
      this.accountSid,
      this.apiKey,
      this.apiSecret,
      { identity: userIdentity },
    );
    token.addGrant(chatGrant);
    token.addGrant(videoGrant);
    return token.toJwt();
  }

  async createChatRoom(roomId: string): Promise<string> {
    const conversation = await this.twilioClient.conversations
      .services(this.conversationSid)
      .conversations.create({ uniqueName: roomId });
    return conversation.sid;
  }

  async joinChatRoom(
    chatRoomSid: string,
    userIdentity: string,
  ): Promise<string> {
    const participant = await this.twilioClient.conversations
      .services(this.conversationSid)
      .conversations(chatRoomSid)
      .participants.create({
        identity: userIdentity,
      });
    return participant.sid;
  }

  async sendSystemMessage(chatRoomSid: string, message: string): Promise<void> {
    await this.twilioClient.conversations
      .services(this.conversationSid)
      .conversations(chatRoomSid)
      .messages.create({
        body: message,
      });
  }

  async leaveChatRoom(
    chatRoomSid: string,
    participantSid: string,
  ): Promise<void> {
    await this.twilioClient.conversations
      .services(this.conversationSid)
      .conversations(chatRoomSid)
      .participants(participantSid)
      .remove();
  }

  async closeChatRoom(chatRoomSid: string): Promise<void> {
    await this.twilioClient.conversations
      .services(this.conversationSid)
      .conversations(chatRoomSid)
      .remove();
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
