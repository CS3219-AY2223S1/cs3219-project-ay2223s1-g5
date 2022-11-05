import { HttpException, UnauthorizedException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class UnauthorizedError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = "Unauthorized";
  }

  getHttpException(): HttpException {
    return new UnauthorizedException(this.message);
  }
}
