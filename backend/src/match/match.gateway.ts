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

  @SubscribeMessage("find")
  async handlefind(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    const existingRoom = await this.roomService.getRoom(userId);
    if (existingRoom) {
      // TODO: Allow reconnection
      client.emit("existingMatch");
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
      const socket = this.server.sockets.get(user.socketId);
      if (!socket) {
        return;
      }

      socket.join(match.roomId);
    }

    this.server.to(match.roomId).emit("found", match);
  }

  @SubscribeMessage("leaveRoom")
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = Number(client.handshake.headers.authorization);
    this.logger.info(`${userId} left rooom`);
    this.server.to(roomId).emit("endMatch");

    // Remove mappings stored in redis
    await this.roomService.removeRoom(roomId);
  }

  @SubscribeMessage("disconnectWithMatch")
  async handleDisconnectWithMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    this.logger.info(`Websocket disconnected with match: ${client.id}`);
    this.server.to(roomId).emit("wait");
  }

  @SubscribeMessage("disconnect")
  async handleDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Websocket disconnected without match: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    // If user has not been matched, remove user from queue
    await this.matchService.removeFromQueue(difficultyLevel, userId);

    // If user has been matched, notify the other user
    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      this.server.to(roomId).emit("wait");
    }
  }
}
