import { Module } from "@nestjs/common";

import { EditorServiceModule } from "src/editor/editor.service.module";

import { RoomService } from "./room.service";

@Module({
  imports: [EditorServiceModule],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomServiceModule {}
