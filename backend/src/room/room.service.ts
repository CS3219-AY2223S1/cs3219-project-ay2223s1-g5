import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ChatService } from "src/chat/chat.service";
import { EditorService } from "src/editor/editor.service";
import { RedisService } from "src/redis/redis.service";

import {
  RoomAuthorizationService,
  RoomManagementService,
} from "./room.interface";

enum Status {
  CONNECTED = 1,
  DISCONNECTED = 0,
}

@Injectable()
export class RoomService
  implements RoomManagementService, RoomAuthorizationService
{
  private static readonly NAMESPACE = "Room";
  private static readonly DELIMITER = ":";

  constructor(
    @InjectPinoLogger(RoomService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
    private readonly editorService: EditorService,
  ) {}

  async createRoom(userIds: number[]): Promise<string> {
    const roomId = nanoid();

    await this.chatService.createChatRoom(roomId);

    for (const userId of userIds) {
      await this.redisService.addKeySet(
        [RoomService.NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${Status.DISCONNECTED}`,
      );

      await this.redisService.setKey(
        [RoomService.NAMESPACE],
        userId.toString(),
        roomId,
      );

      await this.chatService.joinChatRoom(roomId, userId);
    }

    return roomId;
  }

  async joinRoom(
    userId: number,
    roomId: string,
  ): Promise<{ userId: number; isConnected: boolean }[]> {
    this.logger.info(`Joining room [${roomId}]: ${userId}`);
    if ((await this.getRoom(userId)) !== roomId) {
      this.logger.error(`Room mismatch [${roomId}]: ${userId}`);
      // TODO: Improve error type.
      throw new Error(`User ${userId} should not be in room`);
    }

    await this.redisService
      .transaction()
      .deleteFromSet(
        [RoomService.NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.DISCONNECTED}`,
      )
      .addKeySet(
        [RoomService.NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.CONNECTED}`,
      )
      .execute();

    const members = await this.getMembers(roomId);
    if (!members) {
      throw new Error("Internal server error");
    }
    return members;
  }

  async leaveRoom(userId: number, roomId: string): Promise<void> {
    this.logger.info(`Leaving room [${roomId}]: ${userId}`);
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.CONNECTED}`,
    );
    // The user should be connected, but just in case we delete both entries.
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.DISCONNECTED}`,
    );

    await this.chatService.leaveChatRoom(roomId, userId);

    if (
      !(await this.redisService.getSetSize([RoomService.NAMESPACE], roomId))
    ) {
      await this.terminateRoom(roomId);
    }
  }

  async disconnectRoom(userId: number, roomId: string): Promise<void> {
    await this.redisService
      .transaction()
      .addKeySet(
        [RoomService.NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.DISCONNECTED}`,
      )
      .deleteFromSet(
        [RoomService.NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.CONNECTED}`,
      )
      .execute();
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
  }

  async isAuthorized(roomId: string, userId: number): Promise<boolean> {
    const members = await this.getMembers(roomId);
    if (!members) {
      return false;
    }
    return !!members.filter((member) => member.userId === userId).length;
  }

  private async terminateRoom(roomId: string): Promise<void> {
    this.logger.info(`Closing room: ${roomId}`);
    await this.redisService.deleteKey([RoomService.NAMESPACE], roomId);
    // Document ID and room ID are the same.
    await this.editorService.removeDocument(roomId);
    await this.chatService.closeChatRoom(roomId);
  }

  private async getMembers(
    roomId: string,
  ): Promise<{ userId: number; isConnected: boolean }[] | null> {
    const members = await this.redisService.getSet(
      [RoomService.NAMESPACE],
      roomId,
    );
    if (members.length === 0) {
      return null;
    }
    // FIXME: In the rare case that we have a race condition the room
    // can have a member with a duplicate key.
    return members.map((info) => ({
      userId: Number(info.split(RoomService.DELIMITER)[0]),
      isConnected: Boolean(Number(info.split(RoomService.DELIMITER)[1])),
    }));
  }
}
