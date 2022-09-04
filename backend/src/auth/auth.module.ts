import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { ConfigService } from "src/core/config/config.service";
import { CoreModule } from "src/core/core.module";
import { UserServiceModule } from "src/user/user.service.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalAuthGuard } from "./local.guard";
import { LocalStrategy } from "./local.strategy";

@Module({
  imports: [
    UserServiceModule,
    CoreModule,
    JwtModule.registerAsync({
      imports: [CoreModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("jwt.secret"),
        signOptions: {
          expiresIn: configService.get("jwt.validity"),
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalAuthGuard, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
