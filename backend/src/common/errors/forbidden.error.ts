import { ForbiddenException, HttpException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class ForbiddenError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = "Forbidden";
  }

  getHttpException(): HttpException {
    return new ForbiddenException(this.message);
  }
}
