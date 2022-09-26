import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import { Document } from "y-socket.io/dist/server/index";

import { RedisService } from "src/redis/redis.service";

import { EDITOR_DOCUMENT_NAME } from "~shared/constants";

@Injectable()
export class EditorService {
  private static readonly NAMESPACE = "EDITOR";

  constructor(
    @InjectPinoLogger(EditorService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
  ) {}

  async saveDocument(roomId: string, document: Document): Promise<void> {
    if (!document.getText(EDITOR_DOCUMENT_NAME)) {
      return;
    }
    const delta = JSON.stringify(
      document.getText(EDITOR_DOCUMENT_NAME).toDelta(),
    );
    this.logger.info(`Saving document: ${roomId}`);
    await this.redisService.setKey([EditorService.NAMESPACE], roomId, delta);
  }

  async loadDocument(roomId: string, document: Document): Promise<void> {
    const rawDelta = await this.redisService.getValue(
      [EditorService.NAMESPACE],
      roomId,
    );
    if (!rawDelta) {
      return;
    }
    this.logger.info(`Restoring document: ${roomId}`);
    const delta = JSON.parse(rawDelta);
    document.getText(EDITOR_DOCUMENT_NAME).applyDelta(delta);
  }

  async removeDocument(roomId: string): Promise<void> {
    this.logger.info(`Removing document: ${roomId}`);
    await this.redisService.deleteKey([EditorService.NAMESPACE], roomId);
  }
}