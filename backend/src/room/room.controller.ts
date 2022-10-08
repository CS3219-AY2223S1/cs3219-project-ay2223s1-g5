import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";

import { SessionGuard } from "src/auth/session.guard";

import { RoomService } from "./room.service";

@Controller("questions")
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
}
