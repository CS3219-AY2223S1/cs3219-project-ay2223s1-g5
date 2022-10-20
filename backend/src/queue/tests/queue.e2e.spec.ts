import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { compareSync } from "bcrypt";
import { LoggerModule } from "nestjs-pino";
import { io } from "socket.io-client";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { SocketSessionAdapter } from "src/common/adapters/websocket.adapter";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { QueueModule } from "../queue.module";

const userFixtures = [
  {
    // User ID: 1
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
];

describe("User", () => {
  let app: NestExpressApplication;
  const client: TestClient = new TestClient();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        QueueModule,
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

    app = module.createNestApplication<NestExpressApplication>();
    // Mock session data.
    app.useWebSocketAdapter(
      new SocketSessionAdapter(app, (_c, _r) => new MockSessionMiddleware()),
    );
    await app.init();
  });

  beforeEach(async () => {
    await client.reset();
    await client.user.createMany({
      data: userFixtures,
    });
  });

  describe("Connect", () => {
    let address: { port: number };
    beforeAll(() => {
      address = app.getHttpServer().listen().address();
    });

    it(`connects`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/queue`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      clientSocket.on("connect", () => {
        clientSocket.disconnect();
        done();
      });
    });

    it(`unauthorized`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/queue`);
      clientSocket.connect();
      clientSocket.on("connect_error", () => {
        done();
      });
    });

    afterAll(() => {
      app.getHttpServer().close();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
