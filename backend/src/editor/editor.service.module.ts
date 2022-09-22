import { Module } from "@nestjs/common";

import { EditorService } from "./editor.service";

@Module({
  providers: [EditorService],
  exports: [EditorService],
})
export class EditorServiceModule {}
