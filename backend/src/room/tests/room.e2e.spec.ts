import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { Language as PrismaLanguage } from "@prisma/client";
import { createClient, RedisClientType } from "@redis/client";
import { LoggerModule } from "nestjs-pino";
import { io, Socket } from "socket.io-client";

import { AuthModule } from "src/auth/auth.module";
import { SessionSocketAdapter } from "src/common/adapters/session.websocket.adapter";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { RoomServiceInterfaces } from "../room.interface";
import { RoomModule } from "../room.module";
import { RoomService } from "../room.service";

import { ROOM_EVENTS } from "~shared/constants";
import {
  JoinedPayload,
  PartnerDisconnectPayload,
  PartnerLeavePayload,
} from "~shared/types/api";
import { Difficulty, Language } from "~shared/types/base";

const userFixtures = [
  {
    id: 1,
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
  {
    id: 2,
    email: "johndoe@email.com",
    name: "John Doe",
    password: "password",
  },
  {
    id: 3,
    email: "jackdoe@email.com",
    name: "Jack Doe",
    password: "password",
  },
];

const questionFixture = {
  title: "Question",
  difficulty: Difficulty.EASY,
  category: {
    create: { title: "Category" },
  },
  topics: {
    create: [{ name: "Topic" }],
  },
  description: "Description",
  hints: ["Hint 1", "Hint 2"],
  templates: {
    create: [
      {
        language: PrismaLanguage.JAVASCRIPT,
        code: "Code",
      },
    ],
  },
};

describe("Room", () => {
  const client: TestClient = new TestClient();
  const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL,
  });

  let app: NestExpressApplication;
  let adapter: SessionSocketAdapter;
  let address: { port: number };

  let roomSerivce: RoomService;
  let roomId: string;

  beforeAll(async () => {
    await redisClient.connect();

    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        RoomModule,
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

    roomSerivce = module.get<RoomService>(
      RoomServiceInterfaces.RoomManagementService,
    );
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
    await client.question.create({ data: questionFixture });
    roomId = await roomSerivce.createRoom(
      Language.JAVASCRIPT,
      questionFixture.difficulty,
      [1, 2],
    );
  });

  describe("Connect", () => {
    it(`connects`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
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
  });

  describe("Join Room", () => {
    it(`authorized user joins room`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      clientSocket.on(
        ROOM_EVENTS.JOINED,
        ({
          userId,
          metadata: { members, password, language, questionId },
        }: JoinedPayload) => {
          expect(userId).toEqual(1);
          expect(password).toBeDefined();
          expect(language).toBe(Language.JAVASCRIPT);
          expect(questionId).toBe(1);
          expect(members.find((user) => user.userId === 1)).toEqual({
            userId: 1,
            isConnected: true,
          });
          clientSocket.disconnect();
          done();
        },
      );
      clientSocket.emit(ROOM_EVENTS.JOIN, { roomId: roomId });
    });

    it(`unauthorized user does not join room`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "3",
        },
      });
      clientSocket.connect();
      clientSocket.on(ROOM_EVENTS.DISCONNECT, () => {
        done();
      });
      clientSocket.emit(ROOM_EVENTS.JOIN, { roomId: roomId });
    });
  });

  describe("Disconnect", () => {
    let monitorSocket: Socket;

    beforeEach(() => {
      monitorSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "2",
        },
      });
      monitorSocket.connect();
    });

    it(`disconnecting user emits disconnect event`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      monitorSocket.emit(ROOM_EVENTS.JOIN, { roomId });
      // We need to make sure the monitoring socket has already joined the room.
      monitorSocket.on(ROOM_EVENTS.JOINED, () => {
        clientSocket.connect();
      });
      monitorSocket.on(
        ROOM_EVENTS.PARTNER_DISCONNECT,
        ({ userId }: PartnerDisconnectPayload) => {
          expect(userId).toEqual(1);
          done();
        },
      );
      clientSocket.on(ROOM_EVENTS.CONNECT, () => {
        clientSocket.disconnect();
      });
    });

    afterEach(() => {
      monitorSocket.disconnect();
    });
  });

  describe("Leave room", () => {
    let monitorSocket: Socket;

    beforeEach(() => {
      monitorSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "2",
        },
      });
      monitorSocket.connect();
    });

    it(`leave room emits leave event`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      monitorSocket.on(ROOM_EVENTS.JOINED, () => {
        // We make use of the implementation detail that the service
        // deletes both the connected and disconnected states to
        // simplify the test.
        clientSocket.emit(ROOM_EVENTS.LEAVE, { roomId });
      });
      monitorSocket.on(
        ROOM_EVENTS.PARTNER_LEAVE,
        ({ userId }: PartnerLeavePayload) => {
          expect(userId).toEqual(1);
          done();
        },
      );
      monitorSocket.emit(ROOM_EVENTS.JOIN, { roomId });
    });

    it(`leave room prevents reconnection`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      clientSocket.on(ROOM_EVENTS.DISCONNECT, () => {
        clientSocket.on(ROOM_EVENTS.CONNECT, () => {
          clientSocket.on(ROOM_EVENTS.DISCONNECT, () => {
            done();
          });
          clientSocket.emit(ROOM_EVENTS.JOIN, { roomId });
        });
        clientSocket.connect();
      });
      clientSocket.emit(ROOM_EVENTS.LEAVE, { roomId });
    });

    it(`leave room removes user from members list`, (done) => {
      const clientSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      clientSocket.connect();
      clientSocket.emit(ROOM_EVENTS.LEAVE, { roomId });
      clientSocket.on(ROOM_EVENTS.DISCONNECT, () => {
        monitorSocket.emit(ROOM_EVENTS.JOIN, { roomId });
      });
      monitorSocket.on(
        ROOM_EVENTS.JOINED,
        ({ metadata: { members } }: JoinedPayload) => {
          expect(members).toEqual([{ userId: 2, isConnected: true }]);
          done();
        },
      );
    });

    afterEach(() => {
      monitorSocket.disconnect();
    });
  });

  describe("Terminate room", () => {
    it(`terminates room when all users leave`, (done) => {
      client.roomSession
        .findUnique({
          where: { id: roomId },
        })
        .then((room) => expect(room?.endTime).toBeNull());

      const clientOneSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "1",
        },
      });
      const clientTwoSocket = io(`ws://localhost:${address.port}/room`, {
        extraHeaders: {
          Authorization: "true",
          user: "2",
        },
      });
      clientOneSocket.connect();
      clientTwoSocket.connect();
      clientOneSocket.emit(ROOM_EVENTS.LEAVE, { roomId });
      clientTwoSocket.emit(ROOM_EVENTS.LEAVE, { roomId });

      // Tearing down of room is performed asynchronously
      setTimeout(async () => {
        const room = await client.roomSession.findUnique({
          where: { id: roomId },
        });
        expect(room?.endTime).toBeDefined();
        done();
      }, 1000);
    });
  });

  afterAll(async () => {
    app.getHttpServer().close();
    await app.close();
    await adapter.deactivate();
    await redisClient.disconnect();
  });
});
