import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { compareSync } from "bcrypt";
import { hashSync } from "bcrypt";
import { LoggerModule } from "nestjs-pino";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { CoreModule } from "src/core/core.module";
import { TestClient } from "src/core/test/test-client";

import { UserModule } from "../user.module";

const SALT_ROUNDS = 10;
const userFixtures = [
  {
    // User ID: 1
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: hashSync("password", SALT_ROUNDS),
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
        CoreModule,
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
    const mockSessionMiddleware = new MockSessionMiddleware();
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

  describe("POST /users/password", () => {
    it(`update password`, async () => {
      await request(app.getHttpServer())
        .post("/users/password")
        .send({
          oldPassword: "password",
          newPassword: "new_password",
        })
        .set("Authorization", "true")
        .set("user", "1")
        .expect(201);

      const actual = await client.user.findMany({
        where: {
          email: userFixtures[0].email,
        },
      });
      expect(actual).toHaveLength(1);
      expect(compareSync("new_password", actual[0].password)).toBe(true);
    });
  });

  describe("PATCH /users", () => {
    it(`update display name`, async () => {
      await request(app.getHttpServer())
        .patch("/users")
        .send({
          name: "Jane Doe Updated",
        })
        .set("Authorization", "true")
        .set("user", "1")
        .expect(200);

      const actual = await client.user.findMany({
        where: {
          email: userFixtures[0].email,
        },
      });
      expect(actual).toHaveLength(1);
      expect(actual[0].name).toEqual("Jane Doe Updated");
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
        .set("user", "1")
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
        .set("user", "1")
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
