import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { compare, hash } from "bcrypt";

import { UnauthorizedError } from "src/common/errors/unauthorized.error";
import { PrismaService } from "src/core/prisma.service";

const SALT_ROUNDS = 10;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  async getByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async create(data: {
    email: string;
    name: string;
    password: string;
  }): Promise<User | null> {
    const hashedPassword = await hash(data.password, SALT_ROUNDS);
    try {
      return await this.prisma.user.create({
        data: {
          ...data,
          password: hashedPassword,
        },
      });
    } catch (e: unknown) {
      if (!(e instanceof PrismaClientKnownRequestError)) {
        throw e;
      }
      // If error is due to unique constraint violation,
      // then we return null since it means an account with the
      // email already exists.
      // Otherwise, we cannot handle the error.
      if (e.code !== "P2002") {
        throw e;
      }
      return null;
    }
  }

  async updateUserVerification(id: number): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        verified: true,
      },
    });
  }

  async handleFailedLogin(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: id },
      data: { failedLogins: { increment: 1 } },
    });
  }

  async resetFailedAttempts(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: id },
      data: {
        failedLogins: 0,
      },
    });
  }

  async updateUserPassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    if (!user || !(await compare(oldPassword, user.password))) {
      throw new UnauthorizedError("Incorrect password.");
    }
    const hashedPassword = await hash(newPassword, SALT_ROUNDS);
    return this.prisma.user.update({
      where: { id: id },
      data: {
        password: hashedPassword,
        // Reset the number of failed logins after changing password
        failedLogins: 0,
      },
    });
  }

  async updateUserDetails(
    id: number,
    data: Omit<Prisma.UserUpdateInput, "id | email | password | failedLogins">,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: id },
      data,
    });
  }

  async resetUserPassword(id: number, password: string): Promise<User> {
    const hashedPassword = await hash(password, SALT_ROUNDS);
    return this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        failedLogins: 0,
      },
    });
  }
}
