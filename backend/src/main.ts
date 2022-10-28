import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Logger } from "nestjs-pino";

import { SessionSocketAdapter } from "src/common/adapters/session.websocket.adapter";
import { ConfigService } from "src/core/config/config.service";

import { SessionMiddleware } from "./common/middlewares/SessionMiddleware";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix("/api");
  const adapter = new SessionSocketAdapter(
    app,
    (config, redis) => new SessionMiddleware(config, redis),
  );
  await adapter.activate();
  app.useWebSocketAdapter(adapter);

  app.set("trust proxy", true);

  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
