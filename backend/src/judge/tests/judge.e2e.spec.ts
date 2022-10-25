import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { LoggerModule } from "nestjs-pino";
import { io, Socket } from "socket.io-client";

import { AuthModule } from "src/auth/auth.module";
import { SessionSocketAdapter } from "src/common/adapters/session.websocket.adapter";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";
import { RoomService } from "src/room/room.service";

import { JudgeModule } from "../judge.module";
import { JudgeService } from "../judge.service";

import { Language } from "~shared/types/base/index";

const userFixtures = [
  {
    // User ID: 1
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
];

jest.setTimeout(10000);

describe("Judge", () => {
  let app: NestExpressApplication;
  let adapter: SessionSocketAdapter;
  const client: TestClient = new TestClient();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        JudgeModule,
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
    adapter = new SessionSocketAdapter(
      app,
      (_c, _r) => new MockSessionMiddleware(),
    );
    await adapter.activate();
    app.useWebSocketAdapter(adapter);
    await app.init();
  });

  beforeEach(async () => {
    await client.reset();
    await client.user.createMany({
      data: userFixtures,
    });
  });

  describe("Submissions", () => {
    let address: { port: number };
    let clientSocket: Socket;

    beforeAll(() => {
      address = app.getHttpServer().listen().address();
      clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      jest
        .spyOn(RoomService.prototype, "getRoom")
        .mockReturnValue(Promise.resolve("mockRoomId"));
      jest.spyOn(RoomService.prototype, "joinRoom").mockReturnValue(
        Promise.resolve({
          members: [],
          password: "mockPassword",
          language: Language.CPP,
          questionId: 1,
        }),
      );
    });

    afterAll(async () => {
      clientSocket.disconnect();
      await app.close();
      await adapter.deactivate();
    });

    it("should return update submission", (done) => {
      const judgeSpy = jest
        .spyOn(JudgeService.prototype, "sendRequest")
        .mockReturnValue(
          Promise.resolve({
            roomId: "mockRoomId",
            submissionId: "mockSubmissionId",
          }),
        );
      const payload = {
        code: "code",
        questionId: 1,
        language: Language.CPP,
      };

      clientSocket.on("submissionUpdate", ({ submissionId }) => {
        expect(judgeSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code",
          1,
          "mockRoomId",
        );
        expect(submissionId).toBe("mockSubmissionId");
        done();
      });

      clientSocket.emit("join", { roomId: "mockRoomId" });
      clientSocket.emit("submit", payload);
    });

    it("should return submission rejected", (done) => {
      const judgeSpy = jest
        .spyOn(JudgeService.prototype, "sendRequest")
        .mockRejectedValue(new Error("send request fail"));
      const payload = {
        code: "code",
        questionId: 1,
        language: Language.CPP,
      };

      clientSocket.on("reject", ({ reason }) => {
        expect(judgeSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code",
          1,
          "mockRoomId",
        );
        expect(reason).toBe("send request fail");
        done();
      });

      clientSocket.emit("join", { roomId: "mockRoomId" });
      clientSocket.emit("submit", payload);
    });
  });
});
