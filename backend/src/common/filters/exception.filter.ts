import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";

import { BaseError } from "src/common/errors/base.error";

@Catch(BaseError)
export class ExceptionFilter extends BaseExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    super.catch(exception.getHttpException(), host);
  }
}
