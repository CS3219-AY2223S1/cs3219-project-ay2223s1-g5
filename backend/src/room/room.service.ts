import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";

enum Status {
  CONNECTED = 1,
  DISCONNECTED = 0,
}

@Injectable()
export class RoomService {
  private static readonly NAMESPACE = "Room";
  private static readonly DELIMITER = ":";

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
  ) {}

  async createRoom(userIds: number[]): Promise<string> {
    const roomId = nanoid();
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

    // We add before deleting to ensure that the room will not be accidentally terminated.
    await this.redisService.addKeySet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.CONNECTED}`,
    );
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.DISCONNECTED}`,
    );

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

    if (
      (await this.redisService.getSetSize([RoomService.NAMESPACE], roomId)) ===
      0
    ) {
      this.logger.info(`Closing room: ${roomId}`);
      await this.redisService.deleteKey([RoomService.NAMESPACE], roomId);
    }
  }

  async disconnectRoom(userId: number, roomId: string): Promise<void> {
    await this.redisService.addKeySet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.DISCONNECTED}`,
    );
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.CONNECTED}`,
    );
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
  }

  async getMembers(
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
