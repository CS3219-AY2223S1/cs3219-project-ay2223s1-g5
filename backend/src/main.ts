import { NestFactory } from "@nestjs/core";
import { Logger } from "nestjs-pino";

import { SocketSessionAdapter } from "src/common/adapters/websocket.adapter";
import { ConfigService } from "src/core/config/config.service";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix("/api");
  app.useWebSocketAdapter(new SocketSessionAdapter(app));

  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
