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

const userFixtures = [
  {
    id: 1,
    email: "janedoe@email.com",
    name: "Jane Doe",
    password: "password",
  },
  { id: 2, email: "johndoe@email.com", name: "John Doe", password: "password" },
];

const topicFixtures = [
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
];
const questionFixtures = [
  {
    id: 1,
    title: "Integer Replacement",
    difficulty: Difficulty.MEDIUM,
    categoryId: 1,
    description: "description",
  },
];
const categoryFixtures = [
  {
    id: 1,
    title: "Algorithms",
  },
];
const roomSessionFixtures = [
  {
    id: "1",
    startTime: "2022-10-20T01:54:13.692Z",
    endTime: "2022-10-20T01:56:13.692Z",
    questionId: 1,
  },
];
const submissionFixtures = [
  {
    id: "1",
    roomSessionId: "1",
    status: Status.ACCEPTED,
    language: Language.CPP,
    expectedOutput: "expectedOutput",
    code: "code",
    createdAt: "2022-10-20T01:56:13.692Z",
    updatedAt: "2022-10-20T01:56:13.692Z",
  },
];

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
    await client.user.createMany({
      data: userFixtures,
    });
    await client.category.createMany({
      data: categoryFixtures,
    });
    await client.topic.createMany({
      data: topicFixtures,
    });
    await client.question.createMany({
      data: questionFixtures,
    });
    await client.roomSession.createMany({
      data: roomSessionFixtures,
    });
    await client.submission.createMany({
      data: submissionFixtures,
    });
  });

  describe("GET /user/statistics", () => {
    it(`get default statistics`, async () => {
      const expected = {
        attemptSummary: { EASY: 0, MEDIUM: 0, HARD: 0 },
        durationSummary: [],
        peerSummary: [],
        heatmapData: [],
        networkData: { topics: [], links: [] },
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
