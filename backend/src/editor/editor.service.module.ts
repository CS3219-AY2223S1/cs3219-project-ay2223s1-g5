import { forwardRef, Module } from "@nestjs/common";

import { RoomServiceModule } from "src/room/room.service.module";

import { EditorService } from "./editor.service";

@Module({
  imports: [forwardRef(() => RoomServiceModule)],
  providers: [EditorService],
  exports: [EditorService],
})
export class EditorServiceModule {}
