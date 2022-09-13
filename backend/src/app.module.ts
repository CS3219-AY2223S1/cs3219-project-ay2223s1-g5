import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";

import { AuthModule } from "src/auth/auth.module";
import { MatchModule } from "src/match/match.module";
import { UserModule } from "src/user/user.module";
import { VerificationModule } from "src/verification/verification.module";

import { EditorModule } from "./editor/editor.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

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
    UserModule,
    AuthModule,
    VerificationModule,
    MatchModule,
    EditorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
