import { ConflictException, HttpException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = "Conflict";
  }

  getHttpException(): HttpException {
    return new ConflictException(this.message);
  }
}
