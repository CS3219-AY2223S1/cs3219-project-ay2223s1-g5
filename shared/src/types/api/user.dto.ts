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
