import { Body, Controller, Patch, Post } from "@nestjs/common";

import { VerificationService } from "./verification.service";

@Controller("/users/verifications")
export class VerificationController {
  constructor(private service: VerificationService) {}

  @Post()
  async resendVerificationEmail(@Body() { email }: { email: string }) {
    return this.service.sendVerificationEmail(email);
  }

  @Patch()
  async checkVerificationCode(
    @Body() { email, code }: { email: string; code: string },
  ) {
    return this.service.checkVerificationCode(email, code);
  }
}
