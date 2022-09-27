import { Module } from "@nestjs/common";

import { ChatServiceModule } from "src/chat/chat.service.module";
import { EditorServiceModule } from "src/editor/editor.service.module";

import { RoomService } from "./room.service";

@Module({
  imports: [EditorServiceModule, ChatServiceModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomServiceModule {}
