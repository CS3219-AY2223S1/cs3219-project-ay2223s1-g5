import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Session,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { RoomService } from "./room.service";

import { GetRoomIdRes } from "~shared/types/api/room.dto";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  @UseGuards(SessionGuard)
  @Get()
  async getRoomId(
    @Session() session: Request["session"],
  ): Promise<GetRoomIdRes | null> {
    const userId = session.passport?.user.userId;
    if (!userId) {
      throw new NotFoundException("User not found.");
    }
    const room = await this.roomService.getRoom(userId);
    if (!room) {
      return null;
    }
    const roomIdRes = { roomId: room };
    return roomIdRes;
  }

  @UseGuards(SessionGuard)
  @Delete("/leave")
  async leaveRoom(@Session() session: Request["session"]): Promise<void> {
    const userId = session.passport?.user.userId;
    if (!userId) {
      throw new NotFoundException("User not found.");
    }
    const room = await this.roomService.getRoom(userId);
    if (!room) {
      throw new NotFoundException("Room not found.");
    }
    await this.roomService.leaveRoom(userId, room);
  }
}
