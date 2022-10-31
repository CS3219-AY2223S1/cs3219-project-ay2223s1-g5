import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { createClient, RedisClientType } from "@redis/client";
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

import { ROOM_EVENTS } from "~shared/constants";
import { Language } from "~shared/types/base/index";

const userFixtures = [
  {
    // User ID: 1
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
  {
    // User ID: 2
    id: 2,
    email: "johndoe@email.com",
    name: "John Doe",
    password: "password",
  },
];

describe("Judge", () => {
  const client: TestClient = new TestClient();
  const redisClient: RedisClientType = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });

  let app: NestExpressApplication;
  let adapter: SessionSocketAdapter;
  let address: { port: number };

  beforeAll(async () => {
    await redisClient.connect();

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
    address = app.getHttpServer().listen().address();
  });

  beforeEach(async () => {
    await client.reset();
    await client.user.createMany({
      data: userFixtures,
    });
    await redisClient.flushAll();
  });

  describe("Submissions", () => {
    let clientSocket1: Socket;
    let clientSocket2: Socket;
    const mockRoomId = "mockRoomId";

    beforeEach(() => {
      clientSocket1 = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket2 = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "2",
        },
      });

      clientSocket1.connect();
      clientSocket2.connect();

      clientSocket1.emit(ROOM_EVENTS.JOIN, { roomId: mockRoomId });
      clientSocket2.emit(ROOM_EVENTS.JOIN, { roomId: mockRoomId });

      jest
        .spyOn(RoomService.prototype, "getRoom")
        .mockReturnValue(Promise.resolve(mockRoomId));
      jest.spyOn(RoomService.prototype, "joinRoom").mockReturnValue(
        Promise.resolve({
          members: [],
          password: "mockPassword",
          language: Language.CPP,
          questionId: 1,
        }),
      );
    });

    afterEach(() => {
      clientSocket1.disconnect();
      clientSocket2.disconnect();
      jest.resetAllMocks();
    });

    it("should inform the other user submission accepted", (done) => {
      const submitPayload = {
        code: "code",
        questionId: 1,
        language: Language.CPP,
      };
      clientSocket1.emit(ROOM_EVENTS.SUBMIT, submitPayload);
      clientSocket2.on(ROOM_EVENTS.SUBMISSION_ACCEPTED, () => {
        done();
      });
    });

    it("should not allow multiple submissions together", (done) => {
      jest
        .spyOn(JudgeService.prototype as any, "hasSubmission")
        .mockReturnValue(Promise.resolve(true));

      const submitPayload = {
        code: "code",
        questionId: 1,
        language: Language.CPP,
      };
      clientSocket1.emit(ROOM_EVENTS.SUBMIT, submitPayload);

      clientSocket1.on(ROOM_EVENTS.SUBMISSION_REJECTED, ({ reason }) => {
        expect(reason).toBe("Processing previous submission.");
        done();
      });
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

      clientSocket1.on("submissionUpdate", ({ submissionId }) => {
        expect(judgeSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code",
          1,
          "mockRoomId",
        );
        expect(submissionId).toBe("mockSubmissionId");
        done();
      });

      clientSocket1.emit("submit", payload);
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

      clientSocket1.on("reject", ({ reason }) => {
        expect(judgeSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code",
          1,
          "mockRoomId",
        );
        expect(reason).toBe("send request fail");
        done();
      });

      clientSocket1.emit("submit", payload);
    });
  });

  afterAll(async () => {
    app.getHttpServer().close();
    await app.close();
    await adapter.deactivate();
    await redisClient.disconnect();
  });
});
