import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserServiceModule } from "src/user/user.service.module";
import { LocalStrategy } from "./local.strategy";
import { LocalAuthGuard } from "./local.guard";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    UserServiceModule,
    JwtModule.register({
      // TODO: Read secret from ConfigService
      secret: "SECRET",
      signOptions: {
        expiresIn: 604800000, // 7 days
      },
    }),
  ],
  providers: [AuthService, LocalStrategy, LocalAuthGuard, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
