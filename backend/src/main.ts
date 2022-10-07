import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";

import { SocketSessionAdapter } from "src/common/adapters/websocket.adapter";
import { ConfigService } from "src/core/config/config.service";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix("/api");
  app.useWebSocketAdapter(new SocketSessionAdapter(app));
  app.set("trust proxy", true);

  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
