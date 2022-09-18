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

import { RoomService } from "./room.service";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";

@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: ROOM_NAMESPACE })
export class RoomGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly roomService: RoomService,
  ) {}

  @SubscribeMessage(ROOM_EVENTS.JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    this.logger.info(`Joining room: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    if (!(await this.roomService.getRoom(userId))) {
      this.logger.error(`User ${userId} should not be in room`);
      throw new Error(`User ${userId} should not be in room`);
    }

    this.server.to(roomId).emit(ROOM_EVENTS.RECONNECTED);
    client.join(roomId);

    // TODO: Remove
    client.on("disconnect", (reason: string) => {
      console.log(`User disconnected because ${reason}`);
    });
  }

  @SubscribeMessage(ROOM_EVENTS.LEAVE)
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const userId = Number(client.handshake.headers.authorization);
    this.logger.info(`${userId} left rooom`);
    this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_LEAVE);
    await this.roomService.removeUser(userId, roomId);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_DISCONNECT);
    }
  }
}
