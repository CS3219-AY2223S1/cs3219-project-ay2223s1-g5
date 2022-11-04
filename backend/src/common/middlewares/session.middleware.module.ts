import { Module } from "@nestjs/common";

import { SessionMiddleware } from "src/common/middlewares/session.middleware";

@Module({
  providers: [SessionMiddleware],
  exports: [SessionMiddleware],
})
export class SessionMiddlewareModule {}
