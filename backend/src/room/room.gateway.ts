import { Inject, UseFilters, UsePipes } from "@nestjs/common";
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
import { WsExceptionFilter } from "src/common/filters/ws-exception.filter";
import { CustomValidationPipe } from "src/common/pipes/validation.pipe";
import { JudgeService } from "src/judge/judge.service";

import { RoomManagementService, RoomServiceInterfaces } from "./room.interface";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";
import {
  JoinedPayload,
  JoinPayload,
  LeavePayload,
  SubmitPayload,
} from "~shared/types/api";

@UseFilters(WsExceptionFilter)
@UsePipes(CustomValidationPipe)
@WebSocketGateway({ namespace: ROOM_NAMESPACE })
export class RoomGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger(RoomGateway.name)
    private readonly logger: PinoLogger,
    @Inject(RoomServiceInterfaces.RoomManagementService)
    private readonly roomService: RoomManagementService,
    private readonly judgeService: JudgeService,
  ) {}

  @SubscribeMessage(ROOM_EVENTS.JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: JoinPayload,
  ) {
    const userId = Number(session(client).passport?.user.userId);
    try {
      const { language, questionId, members } = await this.roomService.joinRoom(
        userId,
        roomId,
      );
      const payload: JoinedPayload = {
        userId,
        metadata: {
          language,
          members,
          questionId,
        },
      };

      await client.join(roomId);
      this.server.to(roomId).emit(ROOM_EVENTS.JOINED, payload);
    } catch (e: unknown) {
      this.logger.warn(e);
      client.disconnect();
    }
  }

  @SubscribeMessage(ROOM_EVENTS.LEAVE)
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: LeavePayload,
  ) {
    const userId = Number(session(client).passport?.user.userId);
    await this.roomService.leaveRoom(userId, roomId);
    this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_LEAVE, { userId });
    client.disconnect();
  }

  @SubscribeMessage(ROOM_EVENTS.SUBMIT)
  async handleSubmit(
    @ConnectedSocket() client: Socket,
    @MessageBody() submitPayload: SubmitPayload,
  ): Promise<void> {
    const userId = Number(session(client).passport?.user.userId);
    const roomId = await this.roomService.getRoom(userId);

    if (!roomId) {
      return;
    }

    const result = await this.judgeService.sendRequest(
      submitPayload.language,
      submitPayload.code,
      submitPayload.questionId,
      roomId,
    );

    this.server.to(roomId).emit(ROOM_EVENTS.SUBMISSION_RESULT, result);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(session(client).passport?.user.userId);

    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      await this.roomService.disconnectRoom(userId, roomId);
      this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_DISCONNECT, { userId });
    }
  }
}
