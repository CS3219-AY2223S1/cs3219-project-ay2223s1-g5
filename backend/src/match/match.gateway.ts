import { UseGuards } from "@nestjs/common";
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

import { WsAuthGuard } from "src/auth/ws.guard";
import { RoomService } from "src/room/room.service";

import { MatchService } from "./match.service";

import { MATCH_EVENTS, MATCH_NAMESPACE } from "~shared/constants";

@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: MATCH_NAMESPACE })
export class MatchGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly matchService: MatchService,
    private readonly roomService: RoomService,
  ) {}

  @SubscribeMessage(MATCH_EVENTS.ENTER_QUEUE)
  async handleFind(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    const existingRoom = await this.roomService.getRoom(userId);
    if (existingRoom) {
      this.server.to(client.id).emit(MATCH_EVENTS.EXISTING_MATCH, existingRoom);
      return;
    }

    await this.handleQueue(client, difficultyLevel);
  }

  async handleQueue(client: Socket, difficultyLevel: string): Promise<void> {
    this.logger.info(`Joining queue: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    const match = await this.matchService.searchMatch(
      userId,
      difficultyLevel,
      client.id,
    );

    if (!match) {
      return;
    }

    for (const user of match.result) {
      this.server.to(user.socketId).emit(MATCH_EVENTS.MATCH_FOUND, match);
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    await this.matchService.removeFromQueue(userId);
  }
}
