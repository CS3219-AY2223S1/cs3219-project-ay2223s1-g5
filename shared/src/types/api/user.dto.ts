export class CreateUserReq {
  email: string;
  password: string;
  name: string;
}

export class UpdateUserReq {
  name: string;
}

export class UpdatePasswordReq {
  newPassword: string;
  oldPassword: string;
}

export class GetUserNameRes {
  name: string;
}

export class RequestResetPasswordReq {
  email: string;
}

export class ResetPasswordReq {
  userId: number;
  code: string;
  password: string;
}

export class RequestVerifyEmailReq {
  email: string;
}

export class VerifyEmailReq {
  userId: number;
  code: string;
}
