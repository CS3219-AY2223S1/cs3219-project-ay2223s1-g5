import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Namespace, Socket } from "socket.io";

import { session } from "src/common/adapters/websocket.adapter";

import { QueueService } from "./queue.service";

import { QUEUE_EVENTS, QUEUE_NAMESPACE } from "~shared/constants";
import { EnterQueuePayload } from "~shared/types/api";
import { Difficulty, Language } from "~shared/types/base";

@WebSocketGateway({ namespace: QUEUE_NAMESPACE })
export class QueueGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger(QueueGateway.name)
    private readonly logger: PinoLogger,
    private readonly queueService: QueueService,
  ) {}

  @SubscribeMessage(QUEUE_EVENTS.ENTER_QUEUE)
  async handleFind(
    @ConnectedSocket() client: Socket,
    @MessageBody() { difficulty, language }: EnterQueuePayload,
  ): Promise<void> {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);
    const existingRoom = await this.queueService.getExistingRoom(userId);
    if (existingRoom) {
      this.logger.info(`Existing room found: ${existingRoom}`);
      client.emit(QUEUE_EVENTS.EXISTING_MATCH, existingRoom);
      return;
    }

    await this.handleQueue(client, difficulty, language);
  }

  async handleQueue(
    client: Socket,
    difficulty: Difficulty,
    language: Language,
  ): Promise<void> {
    this.logger.info(`Joining queue: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);

    const users = await this.queueService.searchMatch(
      userId,
      difficulty,
      language,
      client.id,
    );

    if (!users) {
      return;
    }

    for (const user of users) {
      this.server.to(user.socketId).emit(QUEUE_EVENTS.MATCH_FOUND);
    }

    const match = await this.queueService.createRoom(
      language,
      difficulty,
      users,
    );
    for (const user of users) {
      this.server.to(user.socketId).emit(QUEUE_EVENTS.ROOM_READY, match);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);
    await this.queueService.removeFromQueue(userId);
  }
}
