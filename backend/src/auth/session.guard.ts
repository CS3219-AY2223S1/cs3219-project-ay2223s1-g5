import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class SessionGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const isAuthenticated = context
      .switchToHttp()
      .getRequest<Request>()
      .isAuthenticated();
    if (!isAuthenticated) {
      // Return 401 instead of 403 status
      throw new UnauthorizedException();
    }
    return true;
  }
}
