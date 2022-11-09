import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { UserServiceModule } from "src/user/user.service.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { LocalGuard } from "./local.guard";
import { LocalStrategy } from "./local.strategy";
import { AuthSerializer } from "./session.serialiser";

@Module({
  imports: [
    UserServiceModule,
    PassportModule.register({
      session: true,
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalGuard, AuthSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
