import { HttpException } from "@nestjs/common";

export abstract class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BaseError";
  }

  abstract getHttpException(): HttpException;
}
