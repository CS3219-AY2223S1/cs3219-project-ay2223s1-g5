import { Module } from "@nestjs/common";

import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { VerificationModule } from "src/verification/verification.module";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [UserModule, AuthModule, VerificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
