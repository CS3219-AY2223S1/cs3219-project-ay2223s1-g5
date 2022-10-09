import "dotenv/config";

import { Injectable, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { BadRequestError } from "../errors/bad-request.error";

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(
    @InjectPinoLogger(ValidationPipe.name)
    private readonly logger: PinoLogger,
  ) {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const error = this.flattenValidationErrors(errors);
        this.logger.info(JSON.stringify(error));
        return new BadRequestError(error.join("\n"));
      },
    });
  }
}
