import { Module } from "@nestjs/common";

import { EditorGateway } from "./editor.gateway";
import { EditorServiceModule } from "./editor.service.module";

@Module({
  imports: [EditorServiceModule],
  providers: [EditorGateway],
})
export class EditorModule {}
