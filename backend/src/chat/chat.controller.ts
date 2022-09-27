import { Controller, Post, Session, UseGuards } from "@nestjs/common";
import { Request } from "express";

import { SessionGuard } from "src/auth/session.guard";

import { ChatService } from "./chat.service";

import { CreateTokenRes } from "~shared/types/api";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(SessionGuard)
  @Post("token")
  async createToken(
    @Session() session: Request["session"],
  ): Promise<CreateTokenRes> {
    const userId = Number(session.passport?.user.userId);
    return this.chatService.createToken(userId);
  }
}
