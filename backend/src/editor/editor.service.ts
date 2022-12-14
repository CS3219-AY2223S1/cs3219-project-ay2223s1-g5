import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Document } from "y-socket.io/dist/server/index";
import { applyUpdate, Doc, encodeStateAsUpdate } from "yjs";

import { REDIS_NAMESPACES } from "src/common/constants/namespaces";
import { RedisService } from "src/core/redis/redis.service";
import {
  RoomAuthorizationService,
  RoomServiceInterfaces,
} from "src/room/room.interface";

import { EDITOR_DOCUMENT_NAME } from "~shared/constants";

@Injectable()
export class EditorService {
  constructor(
    @InjectPinoLogger(EditorService.name)
    private readonly logger: PinoLogger,
    @Inject(forwardRef(() => RoomServiceInterfaces.RoomAuthorizationService))
    private readonly authorizationService: RoomAuthorizationService,
    private readonly redisService: RedisService,
  ) {}

  async isAuthorized(roomId: string, userId: number): Promise<boolean> {
    return this.authorizationService.isAuthorized(roomId, userId);
  }

  async createDocument(roomId: string, template: string): Promise<void> {
    const document = new Doc();
    const text = document.getText(EDITOR_DOCUMENT_NAME);
    // Standardize to LF.
    text.insert(0, template.replace(/\r\n/g, "\n"));
    await this.saveDocument(roomId, document);
  }

  async saveDocument(roomId: string, document: Document | Doc): Promise<void> {
    const update = Buffer.from(encodeStateAsUpdate(document)).toString(
      "base64",
    );
    this.logger.info(`Saving document: ${roomId}`);
    await this.redisService.setKey([REDIS_NAMESPACES.EDITOR], roomId, update);
  }

  async loadDocument(roomId: string, document: Document): Promise<void> {
    const serializedUpdate = await this.redisService.getValue(
      [REDIS_NAMESPACES.EDITOR],
      roomId,
    );
    if (!serializedUpdate) {
      return;
    }
    this.logger.info(`Restoring document: ${roomId}`);
    const update = Buffer.from(serializedUpdate, "base64");
    applyUpdate(document, update);
  }

  async removeDocument(roomId: string): Promise<void> {
    this.logger.info(`Removing document: ${roomId}`);
    await this.redisService.deleteKey([REDIS_NAMESPACES.EDITOR], roomId);
  }
}
