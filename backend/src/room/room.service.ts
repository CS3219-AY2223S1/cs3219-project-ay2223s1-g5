import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";

import { RedisService } from "src/redis/redis.service";

interface Room {
  id: string;
  password: string;
}

@Injectable()
export class RoomService {
  private static readonly NAMESPACE = "room";

  constructor(private redisService: RedisService) {}

  async generateRoom(): Promise<Room> {
    const id = nanoid(10);
    const password = nanoid(4);

    return this.redisService
      .setKey(RoomService.NAMESPACE, id, password)
      .then(() => {
        return { id, password } as Room;
      });
  }

  async checkPassword(id: string, password: string): Promise<boolean> {
    return (
      (await this.redisService.getValue(RoomService.NAMESPACE, id)) === password
    );
  }

  async deleteRoom(id: string): Promise<boolean> {
    return (await this.redisService.deleteKey(RoomService.NAMESPACE, id)) === 1;
  }
}
