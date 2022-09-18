import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RedisService } from "src/redis/redis.service";

@Injectable()
export class RoomService {
  private static readonly NAMESPACE = "Room";

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
        userId.toString(),
      );

      await this.redisService.setKey(
        [RoomService.NAMESPACE],
        userId.toString(),
        roomId,
      );
    }

    return roomId;
  }

  async removeUser(userId: number, roomId: string): Promise<void> {
    this.logger.info(`Removing user ${userId} from room ${roomId}`);
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE],
      roomId,
      userId.toString(),
    );

    if (
      (await this.redisService.getSetSize([RoomService.NAMESPACE], roomId)) ===
      0
    ) {
      this.logger.info(`No more user in room ${roomId}`);
      await this.redisService.deleteKey([RoomService.NAMESPACE], roomId);
    }
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
  }
}
