import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter } from "@nestjs/websockets";

import { BaseError } from "src/common/errors/base.error";

@Catch(BaseError)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: BaseError, host: ArgumentsHost) {
    super.catch(exception.getWsException(), host);
  }
}
