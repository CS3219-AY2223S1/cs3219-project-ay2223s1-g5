import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserServiceModule } from "./user.service.module";

@Module({
  imports: [UserServiceModule],
  controllers: [UserController],
})
export class UserModule {}
