export class CreateUserReq {
  email: string;
  password: string;
  name: string;
}

export class UpdateUserReq {
  name: string;
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
