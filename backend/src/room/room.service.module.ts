import { forwardRef, Module } from "@nestjs/common";

import { ChatServiceModule } from "src/chat/chat.service.module";
import { EditorServiceModule } from "src/editor/editor.service.module";
import { QuestionServiceModule } from "src/question/question.service.module";

import { RoomServiceInterfaces } from "./room.interface";
import { RoomService } from "./room.service";

@Module({
  imports: [
    forwardRef(() => EditorServiceModule),
    forwardRef(() => ChatServiceModule),
    QuestionServiceModule,
  ],
  providers: [
    ...Object.values(RoomServiceInterfaces).map((name) => ({
      provide: name,
      useClass: RoomService,
    })),
  ],
  exports: [
    ...Object.values(RoomServiceInterfaces).map((name) => ({
      provide: name,
      useClass: RoomService,
    })),
  ],
})
export class RoomServiceModule {}
