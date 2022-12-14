import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { createClient, RedisClientType } from "@redis/client";
import { LoggerModule } from "nestjs-pino";
import { io, Socket } from "socket.io-client";

import { AuthModule } from "src/auth/auth.module";
import { SessionSocketAdapter } from "src/common/adapters/session.websocket.adapter";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { CoreModule } from "src/core/core.module";
import { TestClient } from "src/core/test/test-client";
import { RoomService } from "src/room/room.service";

import { QueueModule } from "../queue.module";
import { QueueService } from "../queue.service";

import { QUEUE_EVENTS } from "~shared/constants";
import { Difficulty, Language } from "~shared/types/base";

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

describe("Queue", () => {
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
        QueueModule,
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

  describe("Connect", () => {
    it(`Connects`, (done) => {
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

    it(`Unauthorized`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/queue`);
      clientSocket.connect();
      clientSocket.on("connect_error", () => {
        done();
      });
    });

    it(`Duplicate connection`, (done) => {
      const clientSocket1 = io(`ws://localhost:${address.port}/queue`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      const clientSocket2 = io(`ws://localhost:${address.port}/queue`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });

      clientSocket1.connect();

      clientSocket1.on("connect", () => {
        clientSocket2.connect();
      });

      clientSocket1.on("exception", ({ message }) => {
        expect(message).toBe("Duplicate connection");
        clientSocket1.disconnect();
        clientSocket2.disconnect();
        done();
      });
    });
  });

  describe("Handle find", () => {
    let clientSocket1: Socket;
    let clientSocket2: Socket;

    beforeEach(() => {
      clientSocket1 = io(`ws://localhost:${address.port}/queue`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket2 = io(`ws://localhost:${address.port}/queue`, {
        extraHeaders: {
          Authorization: "true",
          user: "2",
        },
      });

      clientSocket1.connect();
      clientSocket2.connect();
    });

    it("should return existing room found", (done) => {
      jest
        .spyOn(RoomService.prototype, "getRoom")
        .mockReturnValue(Promise.resolve("mockRoomId"));

      clientSocket1.on(QUEUE_EVENTS.EXISTING_MATCH, (existingRoom) => {
        expect(existingRoom).toBe("mockRoomId");
        done();
      });

      clientSocket1.emit(QUEUE_EVENTS.ENTER_QUEUE, {
        language: Language.CPP,
        difficulty: Difficulty.EASY,
      });
    });

    it("should match users with same language and difficulty", (done) => {
      clientSocket1.emit(QUEUE_EVENTS.ENTER_QUEUE, {
        language: Language.CPP,
        difficulty: Difficulty.EASY,
      });

      // To prevent race condition.
      setTimeout(
        () =>
          clientSocket2.emit(QUEUE_EVENTS.ENTER_QUEUE, {
            language: Language.CPP,
            difficulty: Difficulty.EASY,
          }),
        100,
      );

      clientSocket2.on(QUEUE_EVENTS.MATCH_FOUND, () => {
        done();
      });
    });

    it("should create room with correct parameters", (done) => {
      const roomSpy = jest
        .spyOn(RoomService.prototype, "createRoom")
        .mockReturnValue(Promise.resolve("mockRoomId"));
      const queueSpy = jest.spyOn(QueueService.prototype, "createRoom");
      const payload = {
        language: Language.CPP,
        difficulty: Difficulty.EASY,
      };

      clientSocket1.emit(QUEUE_EVENTS.ENTER_QUEUE, payload);

      // To prevent race condition.
      setTimeout(
        () => clientSocket2.emit(QUEUE_EVENTS.ENTER_QUEUE, payload),
        100,
      );

      clientSocket2.on(QUEUE_EVENTS.ROOM_READY, (match) => {
        expect(queueSpy.mock.calls[0][0]).toBe(Language.CPP);
        expect(queueSpy.mock.calls[0][1]).toBe(Difficulty.EASY);

        expect(roomSpy.mock.calls[0][0]).toBe(Language.CPP);
        expect(roomSpy.mock.calls[0][1]).toBe(Difficulty.EASY);
        expect(roomSpy.mock.calls[0][2].sort()).toEqual([1, 2]);

        expect(match.roomId).toEqual("mockRoomId");
        done();
      });
    });

    afterEach(() => {
      clientSocket1.disconnect();
      clientSocket2.disconnect();
      jest.resetAllMocks();
    });
  });

  afterAll(async () => {
    // To prevent the redis client from closing before the sockets are disconnected.
    await new Promise((_) => setTimeout(_, 1000));
    app.getHttpServer().close();
    await app.close();
    await adapter.deactivate();
    await redisClient.disconnect();
  });
});
