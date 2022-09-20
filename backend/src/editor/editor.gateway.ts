import { OnGatewayInit, WebSocketGateway } from "@nestjs/websockets";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import { Document } from "y-socket.io/dist/server/index";

import { EditorService } from "./editor.service";

// TODO: Manually guard the gateway.

// We do not need to specify a namespace since y-socket.io does it for us.
@WebSocketGateway()
export class EditorGateway implements OnGatewayInit {
  ySocketIo: YSocketIO;

  constructor(
    @InjectPinoLogger(EditorGateway.name)
    private readonly logger: PinoLogger,
    private readonly editorService: EditorService,
  ) {}

  afterInit(server: Server) {
    this.ySocketIo = new YSocketIO(server);
    this.ySocketIo.initialize();
    this.ySocketIo.on("document-loaded", async (document: Document) => {
      const roomId = document.name;
      await this.editorService.loadDocument(roomId, document);
    });
    this.ySocketIo.on(
      "all-document-connections-closed",
      async (document: Document) => {
        const roomId = document.name;
        await this.editorService.saveDocument(roomId, document);
        this.logger.info(`Destroying document: ${document.name}}`);
        document.destroy();
      },
    );
  }
}
