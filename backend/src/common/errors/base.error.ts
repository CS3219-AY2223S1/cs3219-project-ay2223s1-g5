import { HttpException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

export abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BaseError";
  }

  getWsException(): WsException {
    return new WsException({ error: this.name, message: this.message });
  }

  abstract getHttpException(): HttpException;
}
