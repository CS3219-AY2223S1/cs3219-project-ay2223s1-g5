import { HttpException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class RateLimitError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = "Too Many Requests";
  }

  getHttpException(): HttpException {
    return new HttpException(this.message, 429);
  }
}
