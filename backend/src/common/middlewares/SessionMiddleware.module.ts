import { Module } from "@nestjs/common";

import { SessionMiddleware } from "src/common/middlewares/SessionMiddleware";

@Module({
  providers: [SessionMiddleware],
  exports: [SessionMiddleware],
})
export class SessionMiddlewareModule {}
