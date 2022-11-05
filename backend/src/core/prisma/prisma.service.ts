import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

import { ConfigService } from "../config/config.service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(readonly configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: `postgresql://${configService.get(
            "database.username",
          )}:${configService.get("database.password")}@${configService.get(
            "database.host",
          )}:${configService.get("database.port")}/${configService.get(
            "database.database",
          )}?schema=public`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
