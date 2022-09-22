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
import { JoinedPayload, JoinPayload, LeavePayload } from "~shared/types/api";

@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: ROOM_NAMESPACE })
export class RoomGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger(RoomGateway.name)
    private readonly logger: PinoLogger,
    private readonly roomService: RoomService,
  ) {}

  @SubscribeMessage(ROOM_EVENTS.JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: JoinPayload,
  ) {
    const userId = Number(client.handshake.headers.authorization);
    try {
      const members = await this.roomService.joinRoom(userId, roomId);
      const payload: JoinedPayload = {
        userId,
        members,
      };

      await client.join(roomId);
      this.server.to(roomId).emit(ROOM_EVENTS.JOINED, payload);
    } catch (e: unknown) {
      client.disconnect();
    }
  }

  @SubscribeMessage(ROOM_EVENTS.LEAVE)
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: LeavePayload,
  ) {
    const userId = Number(client.handshake.headers.authorization);
    await this.roomService.leaveRoom(userId, roomId);
    this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_LEAVE, userId);
    client.disconnect();
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      await this.roomService.disconnectRoom(userId, roomId);
      this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_DISCONNECT, userId);
    }
  }
}
