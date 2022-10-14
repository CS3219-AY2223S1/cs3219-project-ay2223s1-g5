import { UseFilters } from "@nestjs/common";
import { OnGatewayInit, WebSocketGateway } from "@nestjs/websockets";
import { Request } from "express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Server } from "socket.io";
import { YSocketIO } from "y-socket.io/dist/server";
import { Document } from "y-socket.io/dist/server/index";

import { serverMiddlewareSetup } from "src/common/adapters/websocket.adapter";
import { WsExceptionFilter } from "src/common/filters/ws-exception.filter";
import { SessionMiddleware } from "src/common/middlewares/SessionMiddleware";

import { EditorService } from "./editor.service";

// We do not need to specify a namespace since y-socket.io does it for us.
@UseFilters(WsExceptionFilter)
@WebSocketGateway()
export class EditorGateway implements OnGatewayInit {
  ySocketIo: YSocketIO;

  constructor(
    @InjectPinoLogger(EditorGateway.name)
    private readonly logger: PinoLogger,
    private readonly editorService: EditorService,
    private readonly middleware: SessionMiddleware,
  ) {}

  afterInit(server: Server) {
    // We install authentication middleware on all dynamic namespaces created
    server.on("new_namespace", (namespace) => {
      namespace = serverMiddlewareSetup(namespace, this.middleware);
      // Extract room ID
      const roomId = namespace.name.replace(/\/yjs\|/, "");
      namespace.use(async (socket, next) => {
        const request = socket.request as Request;
        const userId = Number(request.session.passport?.user.userId);
        if (await this.editorService.isAuthorized(roomId, userId)) {
          next();
        } else {
          next(new Error("Unauthorized"));
        }
      });
    });
    this.ySocketIo = new YSocketIO(server);
    this.ySocketIo.initialize();

    // Set up listeners
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
