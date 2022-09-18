import { Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { LoggerModule } from "nestjs-pino";
import { join } from "path";

import { AuthModule } from "src/auth/auth.module";
import { MatchModule } from "src/match/match.module";
import { UserModule } from "src/user/user.module";
import { VerificationModule } from "src/verification/verification.module";

import { PrismaServiceModule } from "./core/prisma.service.module";
import { RedisServiceModule } from "./redis/redis.service.module";
import { RoomModule } from "./room/room.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

const FRONTEND_PATH = join(__dirname, "..", "..", "frontend", "build");

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        customProps: () => ({ context: "NestApplication" }),
        customSuccessMessage: (req, res) => {
          return `${req.method} ${req.url} ${res.statusCode}`;
        },
        customErrorMessage: (req, res, err) => {
          return `${req.method} ${req.url} ${res.statusCode}: (${err.name}) ${err.message}`;
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: FRONTEND_PATH,
      exclude: ["/api*", "/socket.io*"],
      serveStaticOptions: {
        setHeaders: function (res, path) {
          // Prevent caching of the frontend files
          if (path === join(FRONTEND_PATH, "index.html")) {
            res.setHeader("Cache-control", "public, max-age=0");
          }
        },
      },
    }),
    RedisServiceModule,
    PrismaServiceModule,
    UserModule,
    AuthModule,
    VerificationModule,
    MatchModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
