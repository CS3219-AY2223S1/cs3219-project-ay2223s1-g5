import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";

import { SessionGuard } from "src/auth/session.guard";

import { RoomService } from "./room.service";

@Controller("room")
export class RoomController {
  constructor(private roomService: RoomService) {}

  @UseGuards(SessionGuard)
  @Get(":userId(\\d+)")
  async checkUserHasRoom(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<boolean> {
    const room = await this.roomService.getRoom(userId);
    return !!room;
  }

  @UseGuards(SessionGuard)
  @Post(":userId(\\d+)/leave")
  async leaveRoom(
    @Param("userId", ParseIntPipe) userId: number,
  ): Promise<void> {
    const room = await this.roomService.getRoom(userId);
    if (!room) {
      throw new NotFoundException("Room not found.");
    }
    await this.roomService.leaveRoom(userId, room);
  }

  @UseGuards(SessionGuard)
  @Post(":userId(\\d+)/join")
  async joinRoom(@Param("userId", ParseIntPipe) userId: number): Promise<void> {
    const room = await this.roomService.getRoom(userId);
    if (!room) {
      throw new NotFoundException("Room not found.");
    }
    await this.roomService.joinRoom(userId, room);
  }
}
