import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { compareSync } from "bcrypt";
import cookieParser from "cookie-parser";
import { sign } from "jsonwebtoken";
import { LoggerModule } from "nestjs-pino";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { UserModule } from "../user.module";

describe("User", () => {
  let app: INestApplication;
  const client: TestClient = new TestClient();

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      imports: [
        // Global modules
        PrismaServiceModule,
        RedisServiceModule,
        LoggerModule.forRoot({
          pinoHttp: {
            level: "silent",
          },
        }),
        // Module under test
        UserModule,
        // Dependencies
        AuthModule,
      ],
    }).compile();

    app = testModule.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  beforeEach(async () => {
    await client.reset();
  });

  it(`POST /users`, async () => {
    const expected = {
      name: "John Doe",
      email: "johndoe@email.com",
      verified: false,
      failedLogins: 0,
    };

    await request(app.getHttpServer())
      .post("/users")
      .send({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "password",
      })
      .expect(201);

    const actual = await client.user.findMany({
      where: {
        email: "johndoe@email.com",
      },
    });
    expect(actual).toHaveLength(1);
    // We use MatchObject rather than equal since we do not test for password or ID.
    expect(actual[0]).toMatchObject(expected);
    expect(compareSync("password", actual[0].password)).toBe(true);
  });

  describe("GET /users", () => {
    it(`Unauthenticated`, async () => {
      await request(app.getHttpServer()).get("/users/1").expect(401);
    });

    it(`Authenticated`, async () => {
      const validToken = sign({ sub: 1 }, process.env.JWT_SECRET || "");

      await request(app.getHttpServer())
        .get("/users/1")
        .set("Cookie", [`accessToken=${validToken}`])
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
