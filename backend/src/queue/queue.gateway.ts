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
    @MessageBody() difficultyLevel: string,
  ): Promise<void> {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);
    const existingRoom = await this.queueService.getExistingRoom(userId);
    if (existingRoom) {
      this.logger.info(`Existing room found: ${existingRoom}`);
      client.emit(QUEUE_EVENTS.EXISTING_MATCH, existingRoom);
      return;
    }

    await this.handleQueue(client, difficultyLevel);
  }

  async handleQueue(client: Socket, difficultyLevel: string): Promise<void> {
    this.logger.info(`Joining queue: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);

    const match = await this.queueService.searchMatch(
      userId,
      difficultyLevel,
      client.id,
    );

    if (!match) {
      return;
    }

    for (const user of match.result) {
      this.server.to(user.socketId).emit(QUEUE_EVENTS.MATCH_FOUND, match);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);
    await this.queueService.removeFromQueue(userId);
  }
}
