import { Inject, UseFilters, UsePipes } from "@nestjs/common";
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
import { RateLimitError } from "src/common/errors/rate-limit.error";
import { WsExceptionFilter } from "src/common/filters/ws-exception.filter";
import { CustomValidationPipe } from "src/common/pipes/validation.pipe";
import { SubmissionService } from "src/submission/submission.service";

import { RoomManagementService, RoomServiceInterfaces } from "./room.interface";

import { ROOM_EVENTS, ROOM_NAMESPACE } from "~shared/constants";
import { CLIENT_EVENTS } from "~shared/constants/events";
import {
  JoinedPayload,
  JoinPayload,
  LeavePayload,
  SubmitPayload,
} from "~shared/types/api";

@UseFilters(WsExceptionFilter)
@UsePipes(CustomValidationPipe)
@WebSocketGateway({ namespace: ROOM_NAMESPACE })
export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Namespace;

  constructor(
    @InjectPinoLogger(RoomGateway.name)
    private readonly logger: PinoLogger,
    @Inject(RoomServiceInterfaces.RoomManagementService)
    private readonly roomService: RoomManagementService,
    private readonly submissionService: SubmissionService,
  ) {}

  @SubscribeMessage(ROOM_EVENTS.JOIN)
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: JoinPayload,
  ) {
    const userId = Number(session(client).passport?.user.userId);
    try {
      const { language, questionId, members, password } =
        await this.roomService.joinRoom(userId, client.id, roomId);
      const payload: JoinedPayload = {
        userId,
        metadata: {
          members,
          password,
          language,
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
      this.logger.warn(`Unable to load room: ${roomId} [${userId}]`);
      return;
    }

    this.server.to(roomId).emit(ROOM_EVENTS.SUBMISSION_ACCEPTED);

    try {
      const completed = await this.submissionService.sendRequest(
        submitPayload.language,
        submitPayload.code,
        submitPayload.questionId,
        roomId,
      );
      if (!completed) {
        return;
      }
      this.handleSubmissionUpdate(roomId, completed.submissionId);
    } catch (e: unknown) {
      if (e instanceof Error) {
        if (!(e instanceof RateLimitError)) {
          this.logger.error(e);
        }
        this.server
          .to(roomId)
          .emit(ROOM_EVENTS.SUBMISSION_REJECTED, { reason: e.message });
        return;
      }
      this.logger.error(e);
      // Propagate error since we can't handle it.
    }
  }

  async handleSubmissionUpdate(
    roomId: string,
    submissionId: string,
  ): Promise<void> {
    this.server
      .to(roomId)
      .emit(ROOM_EVENTS.SUBMISSION_UPDATED, { submissionId });
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

    const roomId = await this.roomService.getRoom(userId);
    if (roomId) {
      const connected = await this.roomService.disconnectRoom(
        userId,
        client.id,
        roomId,
      );
      if (connected) {
        return;
      }
      this.server.to(roomId).emit(ROOM_EVENTS.PARTNER_DISCONNECT, { userId });
    }
  }
}
