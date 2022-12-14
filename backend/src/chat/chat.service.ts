import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { REDIS_NAMESPACES } from "src/common/constants/namespaces";
import { ConflictError } from "src/common/errors/conflict.error";
import { ForbiddenError } from "src/common/errors/forbidden.error";
import { InternalServerError } from "src/common/errors/internal-server.error";
import { RedisService } from "src/core/redis/redis.service";
import { TwilioService } from "src/external/twilio/twilio.service";
import {
  RoomAuthorizationService,
  RoomServiceInterfaces,
} from "src/room/room.interface";
import { UserService } from "src/user/user.service";

const SYSTEM_WELCOME_MESSAGE = "Welcome! Chat with your partner here!";

@Injectable()
export class ChatService {
  private static readonly ROOM_NAMESPACE = "ROOM";
  private static readonly PARTICIPANT_NAMESPACE = "PARTICIPANT";

  constructor(
    @InjectPinoLogger(ChatService.name)
    private readonly logger: PinoLogger,
    @Inject(forwardRef(() => RoomServiceInterfaces.RoomAuthorizationService))
    private readonly roomService: RoomAuthorizationService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly twilioService: TwilioService,
  ) {}

  async createToken(
    userId: number,
  ): Promise<{ token: string; identity: string }> {
    const identity = await this.getIdentity(userId);
    const roomId = await this.roomService.getRoom(userId);
    if (!roomId) {
      throw new ConflictError("No room found.");
    }
    this.logger.info(`Generating chat token: ${userId}`);
    return {
      token: this.twilioService.createChatToken(identity, roomId),
      identity,
    };
  }

  async createChatRoom(roomId: string) {
    const chatRoomSid = await this.twilioService.createChatRoom(roomId);
    this.logger.info(`Creating chat room [${roomId}]: ${chatRoomSid}`);
    this.twilioService
      .sendSystemMessage(chatRoomSid, SYSTEM_WELCOME_MESSAGE)
      .catch((error) => {
        this.logger.warn(error);
      });
    return this.saveChatRoomSid(roomId, chatRoomSid);
  }

  async joinChatRoom(roomId: string, userId: number) {
    if (!(await this.roomService.isAuthorized(roomId, userId))) {
      throw new ForbiddenError("Incorrect room ID.");
    }
    const identityPromise = this.getIdentity(userId).then(async (identity) => {
      const result = await this.getParticipantSid(identity);
      if (result) {
        this.logger.error(`User already a participant: ${userId} (${result})`);
        throw new InternalServerError();
      }
      return identity;
    });

    const chatRoomSidPromise = this.getChatRoomSid(roomId).then(
      (chatRoomSid) => {
        if (!chatRoomSid) {
          this.logger.error(`Unable to retrieve chat room SID: ${roomId}`);
          throw new InternalServerError();
        }
        return chatRoomSid;
      },
    );

    const identity = await identityPromise;
    const chatRoomSid = await chatRoomSidPromise;

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
    const identity = await this.getIdentity(userId);
    try {
      const chatRoomSid = await this.getChatRoomSid(roomId);
      if (!chatRoomSid) {
        this.logger.error(`Unable to retrieve chat room SID: ${roomId}`);
        throw new InternalServerError();
      }
      const participantSid = await this.getParticipantSid(identity);
      if (!participantSid) {
        this.logger.error(`Unable to retrieve participant SID: ${userId}`);
        throw new InternalServerError();
      }
      this.logger.info(
        `Leaving chat room [${chatRoomSid}]: ${userId} (${participantSid})`,
      );
      await this.twilioService.leaveChatRoom(chatRoomSid, participantSid);
    } finally {
      await this.deleteParticipantSid(identity);
    }
  }

  async closeChatRoom(roomId: string) {
    const chatRoomSid = await this.getChatRoomSid(roomId);
    if (!chatRoomSid) {
      this.logger.error(`Unable to retrieve chat room SID: ${roomId}`);
      throw new InternalServerError();
    }
    this.logger.info(`Closing chat room [${roomId}]: ${chatRoomSid}`);
    await this.twilioService.closeChatRoom(chatRoomSid);
    await this.deleteChatRoomSid(roomId);
  }

  private async getIdentity(userId: number): Promise<string> {
    const user = await this.userService.getById(userId);
    if (!user) {
      this.logger.error(`Unable to retrieve user: ${userId}`);
      throw new InternalServerError();
    }
    return user.email;
  }

  private async saveParticipantSid(identity: string, sid: string) {
    await this.redisService.setKey(
      [REDIS_NAMESPACES.CHAT, ChatService.PARTICIPANT_NAMESPACE],
      identity,
      sid,
    );
  }

  private async getParticipantSid(identity: string) {
    return await this.redisService.getValue(
      [REDIS_NAMESPACES.CHAT, ChatService.PARTICIPANT_NAMESPACE],
      identity,
    );
  }

  private async deleteParticipantSid(identity: string) {
    await this.redisService.deleteKey(
      [REDIS_NAMESPACES.CHAT, ChatService.PARTICIPANT_NAMESPACE],
      identity,
    );
  }

  private async saveChatRoomSid(roomId: string, chatRoomSid: string) {
    await this.redisService.setKey(
      [REDIS_NAMESPACES.CHAT, ChatService.ROOM_NAMESPACE],
      roomId,
      chatRoomSid,
    );
  }

  private async getChatRoomSid(roomId: string) {
    return this.redisService.getValue(
      [REDIS_NAMESPACES.CHAT, ChatService.ROOM_NAMESPACE],
      roomId,
    );
  }

  private async deleteChatRoomSid(roomId: string) {
    await this.redisService.deleteKey(
      [REDIS_NAMESPACES.CHAT, ChatService.ROOM_NAMESPACE],
      roomId,
    );
  }
}
