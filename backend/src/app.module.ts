import { Module } from "@nestjs/common";

import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { VerificationModule } from "./verification/verification.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [UserModule, AuthModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
