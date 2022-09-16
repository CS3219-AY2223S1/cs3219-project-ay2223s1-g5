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

  async removeRoom(roomId: string): Promise<void> {
    this.logger.info(`Removing room ${roomId}`);
    const users = await this.redisService.getSet(
      [RoomService.NAMESPACE],
      roomId,
    );

    await this.redisService.deleteKey([RoomService.NAMESPACE], roomId);

    for (const user of users) {
      await this.redisService.deleteKey([RoomService.NAMESPACE], user);
    }
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [RoomService.NAMESPACE],
      userId.toString(),
    );
  }
}
