import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { compareSync } from "bcrypt";
import { LoggerModule } from "nestjs-pino";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { UserModule } from "../user.module";

const userFixtures = [
  {
    // User ID: 1
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
];

describe("User", () => {
  let app: INestApplication;
  const client: TestClient = new TestClient();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        UserModule,
        // Global modules
        PrismaServiceModule,
        RedisServiceModule,
        LoggerModule.forRoot({
          pinoHttp: {
            level: "silent",
          },
        }),
        // Dependencies
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();
    // Mock session data.
    const mockSessionMiddleware = new MockSessionMiddleware(1);
    app.use(mockSessionMiddleware.use.bind(mockSessionMiddleware));
    await app.init();
  });

  beforeEach(async () => {
    await client.reset();
    await client.user.createMany({
      data: userFixtures,
    });
  });

  describe("POST /users", () => {
    it(`create user`, async () => {
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
    it(`duplicate user`, async () => {
      await request(app.getHttpServer())
        .post("/users")
        .send({
          name: "John Doe",
          email: userFixtures[0].email,
          password: "password",
        })
        .expect(409);

      const actual = await client.user.findMany({
        where: {
          email: userFixtures[0].email,
        },
      });
      expect(actual[0]?.name).toBe("Jane Doe");
    });
  });

  describe("GET /users", () => {
    it(`get user`, async () => {
      const expected = {
        name: userFixtures[0].name,
      };
      const actual = await request(app.getHttpServer())
        .get("/users/1")
        .set("Authorization", "true")
        .expect(200);

      expect(actual.body).toMatchObject(expected);
    });

    it(`unauthenticated`, async () => {
      await request(app.getHttpServer()).get("/users/1").expect(401);
    });

    it(`missing user`, async () => {
      await request(app.getHttpServer())
        .get("/users/50")
        .set("Authorization", "true")
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
