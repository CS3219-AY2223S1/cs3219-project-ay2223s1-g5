import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Session } from "express-session";

@Injectable()
export class MockSessionMiddleware implements NestMiddleware {
  private middleware: RequestHandler;

  constructor() {
    this.middleware = (request, _, next) => {
      if (request.headers["authorization"] && request.headers["user"]) {
        request.isAuthenticated = () => true;
        const userId = Number(request.headers["user"]);
        request.session = {
          passport: { user: { userId: userId } },
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
