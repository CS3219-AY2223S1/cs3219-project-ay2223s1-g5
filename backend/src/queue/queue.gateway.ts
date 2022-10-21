import { UseFilters, UsePipes } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Namespace, Socket } from "socket.io";

import { session } from "src/common/adapters/session.websocket.adapter";
import { WsExceptionFilter } from "src/common/filters/ws-exception.filter";
import { CustomValidationPipe } from "src/common/pipes/validation.pipe";

import { QueueService } from "./queue.service";

import { QUEUE_EVENTS, QUEUE_NAMESPACE } from "~shared/constants";
import { CLIENT_EVENTS } from "~shared/constants/events";
import { EnterQueuePayload } from "~shared/types/api";
import { Difficulty, Language } from "~shared/types/base";

@UseFilters(WsExceptionFilter)
@UsePipes(CustomValidationPipe)
@WebSocketGateway({ namespace: QUEUE_NAMESPACE })
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  async handleConnection(client: Socket) {
    const userId = Number(session(client).passport?.user.userId);
    const existing = await this.server.to(`user:${userId}`).allSockets();
    if (existing.size > 0) {
      this.server.to(Array.from(existing)).emit(CLIENT_EVENTS.ERROR, {
        message: "Duplicate connection",
      } as Error);
    }
    await client.join(`user:${userId}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);
    await this.queueService.removeFromQueue(userId);
  }
}
