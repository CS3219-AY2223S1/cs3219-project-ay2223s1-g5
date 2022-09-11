import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Server, Socket } from "socket.io";

import { WsAuthGuard } from "src/auth/ws.guard";

import { MatchService } from "./match.service";

@UseGuards(WsAuthGuard)
@WebSocketGateway({ namespace: "match" })
export class MatchGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
    private readonly service: MatchService,
  ) {}

  @SubscribeMessage("find")
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
    const sockets = await this.server.fetchSockets();
    match.result.forEach((user) => {
      for (const socket of sockets) {
        if (socket.id === user.socketId) {
          socket.join(match.roomId);
        }
      }
    });

    this.server.to(match.roomId).emit("found", match);
  }

  @SubscribeMessage("disconnect")
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    // TODO: Call service.
  }
}
