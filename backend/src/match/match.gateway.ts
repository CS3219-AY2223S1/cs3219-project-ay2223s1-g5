import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
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
export class MatchGateway {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly matchService: MatchService,
    private readonly roomService: RoomService,
  ) {}

  @SubscribeMessage(MATCH_EVENTS.ENTER_QUEUE)
  async handlefind(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    const existingRoom = await this.roomService.getRoom(userId);
    if (existingRoom) {
      client.emit(MATCH_EVENTS.EXISTING_MATCH, existingRoom);
      return;
    }

    await this.handleQueue(client, difficultyLevel);
  }

  async handleQueue(client: Socket, difficultyLevel: string): Promise<void> {
    this.logger.info(`Joining queue: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    client.on(MATCH_EVENTS.DISCONNECT, () => {
      this.handleDisconnect(client, difficultyLevel);
    });

    const match = await this.matchService.searchMatch(
      userId,
      difficultyLevel,
      client.id,
    );

    if (!match) {
      return;
    }

    for (const user of match.result) {
      this.server.sockets
        .get(user.socketId)
        ?.emit(MATCH_EVENTS.MATCH_FOUND, match);
    }
  }

  async handleDisconnect(client: Socket, difficultyLevel: string) {
    this.logger.info(`Websocket disconnected: ${client.id} ${difficultyLevel}`);
    const userId = Number(client.handshake.headers.authorization);
    await this.matchService.removeFromQueue(difficultyLevel, userId);
  }
}
