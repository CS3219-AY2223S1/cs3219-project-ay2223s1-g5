import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "@prisma/client";

import { UserService } from "src/user/user.service";

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }
  serializeUser(
    { id }: Pick<User, "id">,
    done: (err: Error | null, user: { userId: number }) => void,
  ) {
    done(null, { userId: id });
  }

  async deserializeUser(
    payload: { userId: number },
    done: (
      err: Error | null,
      user: Pick<User, "email" | "name" | "id"> | null,
    ) => void,
  ) {
    const user = await this.userService.getById(payload.userId);
    if (!user) {
      done(new Error("User not found."), null);
      return;
    }
    const { name, email, id: userId } = user;
    done(null, { name, email, id: userId });
  }
}
