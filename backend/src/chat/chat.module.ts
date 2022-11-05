import { Module } from "@nestjs/common";

import { ChatController } from "./chat.controller";
import { ChatServiceModule } from "./chat.service.module";

@Module({
  imports: [ChatServiceModule],
  controllers: [ChatController],
})
export class ChatModule {}
