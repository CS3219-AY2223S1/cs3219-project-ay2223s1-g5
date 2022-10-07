import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Session } from "express-session";

@Injectable()
export class MockSessionMiddleware implements NestMiddleware {
  private middleware: RequestHandler;

  constructor(userId?: number) {
    this.middleware = (request, _, next) => {
      if (request.headers["authorization"]) {
        request.isAuthenticated = () => true;
        request.session = {
          passport: { user: { userId: userId || 1 } },
        } as unknown as Session;
        next();
        return;
      }
      request.isAuthenticated = () => false;
      next();
    };
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next);
  }
}
