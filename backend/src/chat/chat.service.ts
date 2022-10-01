import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";
import { TwilioService } from "src/twilio/twilio.service";
import { UserService } from "src/user/user.service";

const SYSTEM_WELCOME_MESSAGE = "Welcome! Chat with your partner here!";

@Injectable()
export class ChatService {
  private static readonly NAMESPACE = "CHAT";
  private static readonly ROOM_NAMESPACE = "ROOM";
  private static readonly PARTICIPANT_NAMESPACE = "PARTICIPANT";

  constructor(
    @InjectPinoLogger(ChatService.name)
    private readonly logger: PinoLogger,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly twilioService: TwilioService,
  ) {}

  async createToken(
    userId: number,
  ): Promise<{ token: string; identity: string }> {
    const identity = await this.getIdentity(userId);
    this.logger.info(`Generating chat token: ${userId}`);
    return {
      token: this.twilioService.createConversationsToken(identity),
      identity,
    };
  }

  async createChatRoom(roomId: string) {
    const chatRoomSid = await this.twilioService.createChatRoom(roomId);
    this.logger.info(`Creating chat room [${roomId}]: ${chatRoomSid}`);
    await this.saveChatRoomSid(roomId, chatRoomSid);
    await this.twilioService.sendSystemMessage(
      chatRoomSid,
      SYSTEM_WELCOME_MESSAGE,
    );
  }

  async joinChatRoom(roomId: string, userId: number) {
    const chatRoomSid = await this.getChatRoomSid(roomId);
    const identity = await this.getIdentity(userId);
    // TODO: Verify that user is participant of room.
    if (await this.getParticipantSid(identity)) {
      const participantSid = await this.getParticipantSid(identity);
      this.logger.warn(
        `User already a participant: ${userId} (${participantSid})`,
      );
      throw new Error();
    }
    if (!chatRoomSid) {
      this.logger.warn(`Unable to retrieve chat room SID: ${roomId}`);
      throw new Error();
    }
    const participantSid = await this.twilioService.joinChatRoom(
      chatRoomSid,
      identity,
    );
    this.logger.info(
      `Joined chat room [${chatRoomSid}]: ${userId} (${participantSid})`,
    );
    await this.saveParticipantSid(identity, participantSid);
  }

  async leaveChatRoom(roomId: string, userId: number) {
    const chatRoomSid = await this.getChatRoomSid(roomId);
    const identity = await this.getIdentity(userId);
    const participantSid = await this.getParticipantSid(identity);
    if (!participantSid) {
      this.logger.warn(`Unable to retrieve participant SID: ${userId}`);
      throw new Error();
    }
    if (!chatRoomSid) {
      this.logger.warn(`Unable to retrieve chat room SID: ${roomId}`);
      throw new Error();
    }
    this.logger.info(
      `Leaving chat room [${chatRoomSid}]: ${userId} (${participantSid})`,
    );
    await this.twilioService.leaveChatRoom(chatRoomSid, participantSid);
    await this.deleteParticipantSid(identity);
  }

  async closeChatRoom(roomId: string) {
    const chatRoomSid = await this.getChatRoomSid(roomId);
    if (!chatRoomSid) {
      this.logger.warn(`Unable to retrieve chat room SID: ${roomId}`);
      throw new Error();
    }
    this.logger.info(`Closing chat room [${roomId}]: ${chatRoomSid}`);
    await this.twilioService.closeChatRoom(chatRoomSid);
    await this.deleteChatRoomSid(roomId);
  }

  private async getIdentity(userId: number): Promise<string> {
    const user = await this.userService.getById(userId);
    if (!user) {
      this.logger.warn(`Unable to retrieve user: ${userId}`);
      throw new Error();
    }
    return user.email;
  }

  private async saveParticipantSid(identity: string, sid: string) {
    await this.redisService.setKey(
      [ChatService.NAMESPACE, ChatService.PARTICIPANT_NAMESPACE],
      identity,
      sid,
    );
  }

  private async getParticipantSid(identity: string) {
    return await this.redisService.getValue(
      [ChatService.NAMESPACE, ChatService.PARTICIPANT_NAMESPACE],
      identity,
    );
  }

  private async deleteParticipantSid(identity: string) {
    await this.redisService.deleteKey(
      [ChatService.NAMESPACE, ChatService.PARTICIPANT_NAMESPACE],
      identity,
    );
  }

  private async saveChatRoomSid(roomId: string, chatRoomSid: string) {
    await this.redisService.setKey(
      [ChatService.NAMESPACE, ChatService.ROOM_NAMESPACE],
      roomId,
      chatRoomSid,
    );
  }

  private async getChatRoomSid(roomId: string) {
    return this.redisService.getValue(
      [ChatService.NAMESPACE, ChatService.ROOM_NAMESPACE],
      roomId,
    );
  }

  private async deleteChatRoomSid(roomId: string) {
    await this.redisService.deleteKey(
      [ChatService.NAMESPACE, ChatService.ROOM_NAMESPACE],
      roomId,
    );
  }
}
