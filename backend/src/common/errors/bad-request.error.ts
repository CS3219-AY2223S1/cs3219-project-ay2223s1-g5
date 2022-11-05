import { BadRequestException, HttpException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message);
    this.name = "Bad Request";
  }

  getHttpException(): HttpException {
    return new BadRequestException(this.message);
  }
}
