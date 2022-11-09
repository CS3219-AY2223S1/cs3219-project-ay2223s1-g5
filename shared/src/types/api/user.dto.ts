import { IsEmail, IsNumber } from "class-validator";

import { IsNonEmptyString } from "../../decorators/is-non-empty-string.decorator";
import { IsStrongPassword } from "../../decorators/is-strong-password.decorator";

export class CreateUserReq {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;

  @IsNonEmptyString()
  name: string;
}

export class UpdateUserReq {
  @IsNonEmptyString()
  name: string;
}

export class UpdatePasswordReq {
  @IsStrongPassword()
  newPassword: string;

  @IsNonEmptyString()
  oldPassword: string;
}

export class RequestResetPasswordReq {
  @IsEmail()
  email: string;
}

export class ResetPasswordReq {
  @IsNumber()
  userId: number;

  @IsNonEmptyString()
  code: string;

  @IsStrongPassword()
  password: string;
}

export class RequestVerifyEmailReq {
  @IsEmail()
  email: string;
}

export class VerifyEmailReq {
  @IsNumber()
  userId: number;

  @IsNonEmptyString()
  code: string;
}

export type GetUserNameRes = {
  name: string;
};
