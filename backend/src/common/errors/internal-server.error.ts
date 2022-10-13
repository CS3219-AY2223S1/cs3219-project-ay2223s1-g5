import { HttpException, InternalServerErrorException } from "@nestjs/common";

import { BaseError } from "./base.error";

export class InternalServerError extends BaseError {
  constructor(message?: string) {
    super(message || "Something went wrong");
    this.name = "Internal Server Error";
  }

  getHttpException(): HttpException {
    return new InternalServerErrorException(this.message);
  }
}
