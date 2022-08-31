import { NestFactory } from "@nestjs/core";

import { ConfigService } from "./core/config/config.service";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api");

  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
