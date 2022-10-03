import { forwardRef, Module } from "@nestjs/common";

import { RoomServiceModule } from "src/room/room.service.module";
import { TwilioServiceModule } from "src/twilio/twilio.service.module";
import { UserServiceModule } from "src/user/user.service.module";

import { ChatService } from "./chat.service";

@Module({
  imports: [
    UserServiceModule,
    TwilioServiceModule,
    forwardRef(() => RoomServiceModule),
  ],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatServiceModule {}
