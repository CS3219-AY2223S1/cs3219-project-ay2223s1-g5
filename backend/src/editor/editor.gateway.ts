import { OnGatewayInit, WebSocketGateway } from "@nestjs/websockets";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";

// TODO: Manually guard the gateway.

// We do not need to specify a namespace since y-socket.io does it for us.
@WebSocketGateway()
export class EditorGateway implements OnGatewayInit {
  ySocketIo: YSocketIO;

  constructor(
    @InjectPinoLogger()
    private readonly logger: PinoLogger,
  ) {}

  afterInit(server: Server) {
    this.ySocketIo = new YSocketIO(server);
    this.ySocketIo.initialize();
  }
}
