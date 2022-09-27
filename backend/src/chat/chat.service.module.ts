import { Module } from "@nestjs/common";

import { TwilioServiceModule } from "src/twilio/twilio.service.module";
import { UserServiceModule } from "src/user/user.service.module";

import { ChatService } from "./chat.service";

@Module({
  imports: [UserServiceModule, TwilioServiceModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatServiceModule {}
