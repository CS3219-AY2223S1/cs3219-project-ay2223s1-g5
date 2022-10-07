import { Module } from "@nestjs/common";

import { SessionMiddleware } from "src/common/middlewares/SessionMiddleware";
import { CoreModule } from "src/core/core.module";

@Module({
  imports: [CoreModule],
  providers: [SessionMiddleware],
  exports: [SessionMiddleware],
})
export class SessionMiddlewareModule {}
