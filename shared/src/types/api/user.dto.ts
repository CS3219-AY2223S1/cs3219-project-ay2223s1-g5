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
