import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Language } from "@prisma/client";
import { LoggerModule } from "nestjs-pino";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { PrismaServiceModule } from "src/core/prisma.service.module";
import { TestClient } from "src/core/test/test-client";
import { RedisServiceModule } from "src/redis/redis.service.module";

import { StatisticsModule } from "../statistics.module";

import { Difficulty } from "~shared/types/base";
import { Status } from "~shared/types/base";

describe("User", () => {
  let app: INestApplication;
  const client: TestClient = new TestClient();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        StatisticsModule,
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
    const mockSessionMiddleware = new MockSessionMiddleware();
    app.use(mockSessionMiddleware.use.bind(mockSessionMiddleware));
    await app.init();
  });

  beforeEach(async () => {
    await client.reset();
    await client.category.create({
      data: {
        id: 1,
        title: "Algorithms",
      },
    });
    await client.topic.createMany({
      data: [
        {
          id: 1,
          name: "Dynamic Programming",
        },
        {
          id: 2,
          name: "Bit Manipulation",
        },
        {
          id: 3,
          name: "Greedy",
        },
        {
          id: 4,
          name: "Memoization",
        },
      ],
    });
    await client.question.create({
      data: {
        id: 1,
        title: "Integer Replacement",
        difficulty: Difficulty.MEDIUM,
        categoryId: 1,
        description: "description",
        topics: {
          connect: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        },
      },
      include: {
        topics: true,
      },
    });
    await client.roomSession.create({
      data: {
        id: "1",
        startTime: "2022-10-20T01:54:13.692Z",
        endTime: "2022-10-20T01:56:13.692Z",
        questionId: 1,
      },
    });
    await client.submission.create({
      data: {
        id: "1",
        roomSessionId: "1",
        status: Status.ACCEPTED,
        language: Language.CPP,
        expectedOutput: "expectedOutput",
        code: "code",
        createdAt: "2022-10-20T01:56:13.692Z",
        updatedAt: "2022-10-20T01:56:13.692Z",
      },
    });
    await client.user.create({
      data: {
        id: 1,
        email: "janedoe@email.com",
        name: "Jane Doe",
        password: "password",
        roomSessions: {
          connect: {
            id: "1",
          },
        },
      },
      include: {
        roomSessions: true,
      },
    });
    await client.user.create({
      data: {
        id: 2,
        email: "johndoe@email.com",
        name: "John Doe",
        password: "password",
        roomSessions: {
          connect: {
            id: "1",
          },
        },
      },
      include: {
        roomSessions: true,
      },
    });
  });

  describe("GET /user/statistics", () => {
    it(`get default statistics`, async () => {
      const expected = {
        attemptSummary: { EASY: 0, MEDIUM: 1, HARD: 0 },
        durationSummary: [
          {
            difficulty: "MEDIUM",
            timetaken: 120,
            date: "2022-10-20T01:54:13.692Z",
          },
        ],
        peerSummary: [
          {
            userName: "John Doe",
            questionTitle: "Integer Replacement",
            date: "2022-10-20T01:54:13.692Z",
          },
        ],
        heatmapData: [{ date: "2022-10-20T01:54:13.692Z" }],
        networkData: {
          topics: [
            { count: 3, id: 1, name: "Dynamic Programming" },
            { count: 3, id: 2, name: "Bit Manipulation" },
            { count: 3, id: 3, name: "Greedy" },
            { count: 3, id: 4, name: "Memoization" },
          ],
          links: [
            { largeTopicId: 1, smallTopicId: 2 },
            { largeTopicId: 1, smallTopicId: 3 },
            { largeTopicId: 1, smallTopicId: 4 },
            { largeTopicId: 2, smallTopicId: 3 },
            { largeTopicId: 2, smallTopicId: 4 },
            { largeTopicId: 3, smallTopicId: 4 },
          ],
        },
      };
      const actual = await request(app.getHttpServer())
        .get("/user/statistics")
        .set("Authorization", "true")
        .set("user", "1")
        .expect(200);
      console.log(actual.body);
      expect(actual.body).toStrictEqual(expected);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
