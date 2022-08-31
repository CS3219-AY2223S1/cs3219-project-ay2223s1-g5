import { Injectable } from "@nestjs/common";
import { Prisma, User } from "@prisma/client";
import { compare, hash } from "bcrypt";

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
  }): Promise<User> {
    const hashedPassword = await hash(data.password, SALT_ROUNDS);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
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
    if (!user || !compare(oldPassword, user.password)) {
      // TODO: Handle incorrect password error.
      throw new Error();
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
}
