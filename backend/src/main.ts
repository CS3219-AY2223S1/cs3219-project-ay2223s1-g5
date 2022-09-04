import { HttpAdapterHost, NestFactory } from "@nestjs/core";

import { ExceptionFilter } from "src/common/filters/exception.filter";
import { ConfigService } from "src/core/config/config.service";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api");
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(httpAdapter));

  const configService = app.get(ConfigService);
  await app.listen(configService.get("port"));
}
bootstrap();
