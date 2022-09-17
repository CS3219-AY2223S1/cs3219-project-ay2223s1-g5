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

    this.handleQueue(client, difficultyLevel);
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

    // Get sockets by ID and let them join the same room
    for (const user of match.result) {
      this.server.sockets
        .get(user.socketId)
        ?.emit("MATCH_EVENTS.MATCH_FOUND", match);
    }
  }

  @SubscribeMessage(MATCH_EVENTS.LEAVE_QUEUE)
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = Number(client.handshake.headers.authorization);
    this.logger.info(`${userId} left rooom`);
    this.server.to(roomId).emit(MATCH_EVENTS.END_MATCH);

    // Remove mappings stored in redis
    await this.roomService.removeRoom(roomId);
  }

  @SubscribeMessage(MATCH_EVENTS.DISCONNECT)
  async handleDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    // If user has not been matched, remove user from queue
    await this.matchService.removeFromQueue(difficultyLevel, userId);

    // If user has been matched, notify the other user
    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      this.server.to(roomId).emit(MATCH_EVENTS.WAIT);
    }
  }
}
