import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, RequestHandler, Response } from "express";
import helmet from "helmet";

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  private middleware: RequestHandler;

  constructor() {
    this.middleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: [
            "'self'",
            "wss://signaling.yjs.dev/",
            "wss://y-webrtc-signaling-us.herokuapp.com/",
            "wss://y-webrtc-signaling-eu.herokuapp.com/",
            "https://ecs.us1.twilio.com",
            "wss://tsock.us1.twilio.com/",
            "wss://global.vss.twilio.com",
            "wss://sdkgw.us1.twilio.com",
          ],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdn.jsdelivr.net",
            "data:",
          ],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
          ],
          scriptSrcElem: ["'self'", "https://cdn.jsdelivr.net"],
          scriptSrcAttr: ["'none'"],
          scriptSrc: ["'self'"],
          mediaSrc: ["mediastream:"],
          upgradeInsecureRequests: [],
          workerSrc: ["'self'", "blob:"],
        },
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    this.middleware(req, res, next);
  }
}
