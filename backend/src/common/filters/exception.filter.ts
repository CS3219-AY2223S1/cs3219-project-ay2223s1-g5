import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Response } from "express";

import { BaseError } from "src/common/errors/base.error";

import { JWT_COOKIE_NAME } from "~shared/constants";

const processUnauthorizedException = (
  exception: UnauthorizedException,
  response: Response,
) => {
  const body =
    exception.getResponse() instanceof Object
      ? exception
      : {
          status: exception.getStatus(),
          message: exception.getResponse(),
        };
  response
    .clearCookie(JWT_COOKIE_NAME)
    .status(exception.getStatus())
    .json(body);
};

// In the case of an unauthorized exception, we clear the user's cookies.
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    processUnauthorizedException(exception, response);
  }
}

@Catch(BaseError)
export class CustomExceptionFilter extends BaseExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    const httpException = exception.getHttpException();
    // In the case of an unauthorized exception, we clear the user's cookies.
    if (httpException instanceof UnauthorizedException) {
      const response = host.switchToHttp().getResponse<Response>();
      processUnauthorizedException(httpException, response);
      return;
    }
    super.catch(exception.getHttpException(), host);
  }
}
