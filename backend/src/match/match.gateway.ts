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
    private readonly service: MatchService,
  ) {}

  @SubscribeMessage(MATCH_EVENTS.ENTER_QUEUE)
  async handleFind(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ): Promise<void> {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    const match = await this.service.searchMatch(
      userId,
      difficultyLevel,
      client.id,
    );

    if (!match) {
      return;
    }

    // Get sockets by ID and let them join the same room
    match.result.forEach((user) => {
      const socket = this.server.sockets.get(user.socketId);
      if (!socket) {
        return;
      }

      socket.join(match.roomId);

      // Inform the other user about disconnection
      socket.on("disconnecting", () => {
        this.server.to(match.roomId).emit("endMatch");
      });
    });

    this.server.to(match.roomId).emit(MATCH_EVENTS.MATCH_FOUND, match);
  }

  @SubscribeMessage("disconnect")
  async handleDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() difficultyLevel: string,
  ) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);

    // If user has not been matched, remove user from queue
    await this.service.removeFromQueue(difficultyLevel, userId);
  }
}
