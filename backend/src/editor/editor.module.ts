import { Module } from "@nestjs/common";

import { SessionMiddlewareModule } from "src/common/middlewares/session.middleware.module";

import { EditorGateway } from "./editor.gateway";
import { EditorServiceModule } from "./editor.service.module";

@Module({
  imports: [EditorServiceModule, SessionMiddlewareModule],
  providers: [EditorGateway],
})
export class EditorModule {}
