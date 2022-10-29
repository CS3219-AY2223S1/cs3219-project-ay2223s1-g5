import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { LoggerModule } from "nestjs-pino";
import passport from "passport";
import { join } from "path";

import { AuthModule } from "src/auth/auth.module";
import { ChatModule } from "src/chat/chat.module";
import { ExceptionFilter } from "src/common/filters/exception.filter";
import { SessionMiddleware } from "src/common/middlewares/SessionMiddleware";
import { SessionMiddlewareModule } from "src/common/middlewares/SessionMiddleware.module";
import { CustomValidationPipe } from "src/common/pipes/validation.pipe";
import { CoreModule } from "src/core/core.module";
import { PrismaServiceModule } from "src/core/prisma/prisma.service.module";
import { RedisServiceModule } from "src/core/redis/redis.service.module";
import { EditorModule } from "src/editor/editor.module";
import { JudgeModule } from "src/judge/judge.module";
import { QuestionModule } from "src/question/question.module";
import { QueueModule } from "src/queue/queue.module";
import { RoomModule } from "src/room/room.module";
import { StatisticsModule } from "src/statistics/statistics.module";
import { SubmissionModule } from "src/submission/submission.module";
import { UserModule } from "src/user/user.module";

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
    CoreModule,
    AuthModule,
    UserModule,
    QueueModule,
    RoomModule,
    ChatModule,
    EditorModule,
    QuestionModule,
    JudgeModule,
    StatisticsModule,
    SubmissionModule,
    // For custom WebSocket adapter
    SessionMiddlewareModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware, passport.initialize(), passport.session())
      .forRoutes("*");
  }
}
