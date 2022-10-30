import { Global, Module } from "@nestjs/common";

import { CoreModule } from "./core.module";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  imports: [CoreModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaServiceModule {}
