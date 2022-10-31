import { Module } from "@nestjs/common";

import { ConfigServiceModule } from "../config/config.service.module";

import { PrismaService } from "./prisma.service";

@Module({
  imports: [ConfigServiceModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaServiceModule {}
