import { IsEmail } from "class-validator";

import { IsStrongPassword } from "../../decorators/is-strong-password.decorator";

export class LoginReq {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}

export type LoginRes = {
  userId: number;
  email: string;
  name: string;
};
