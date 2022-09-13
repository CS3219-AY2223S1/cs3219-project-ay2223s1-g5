export class LoginReq {
  email: string;
  password: string;
}

export class LoginRes {
  userId: number;
  email: string;
  name: string;
}

export class VerifyEmailReq {
  userId: number;
  code: string;
}
