import { UseGuards } from "@nestjs/common";
import {
  ConnectedSocket,
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
  handleFind(@ConnectedSocket() client: Socket): void {
    this.logger.info(`Handling find match request: ${client.id}`);
    const userId = Number(client.handshake.headers.authorization);
    // TODO: Call service.
    return;
  }

  @SubscribeMessage("disconnect")
  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.info(`Websocket disconnected: ${client.id}`);
    // TODO: Call service.
  }
}
