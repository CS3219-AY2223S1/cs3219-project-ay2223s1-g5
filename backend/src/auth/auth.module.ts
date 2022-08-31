import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserServiceModule } from "src/user/user.service.module";
import { LocalStrategy } from "./local.strategy";
import { LocalAuthGuard } from "./local.guard";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigService } from "src/core/config/config.service";
import { CoreModule } from "src/core/core.module";

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
