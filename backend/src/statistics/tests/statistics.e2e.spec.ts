import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Language } from "@prisma/client";
import { addMinutes, subDays } from "date-fns";
import { LoggerModule } from "nestjs-pino";
import request from "supertest";

import { AuthModule } from "src/auth/auth.module";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { CoreModule } from "src/core/core.module";
import { TestClient } from "src/core/test/test-client";

import { StatisticsModule } from "../statistics.module";

import { Difficulty } from "~shared/types/base";
import { Status } from "~shared/types/base";

describe("User", () => {
  let app: INestApplication;
  const client: TestClient = new TestClient();
  const startTimeRoomOne = subDays(new Date(), 20);
  const endTimeRoomOne = addMinutes(subDays(new Date(), 20), 5);
  const startTimeRoomTwo = subDays(new Date(), 15);
  const endTimeRoomTwo = addMinutes(subDays(new Date(), 15), 5);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Module under test
        StatisticsModule,
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
        {
          id: 5,
          name: "Two Pointers",
        },
        {
          id: 6,
          name: "String",
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
    });
    await client.question.create({
      data: {
        id: 2,
        title: "Remove Palindromic Subsequences",
        difficulty: Difficulty.EASY,
        categoryId: 1,
        description: "description",
        topics: {
          connect: [{ id: 4 }, { id: 5 }, { id: 6 }],
        },
      },
    });
    await client.roomSession.create({
      data: {
        id: "1",
        startTime: startTimeRoomOne,
        endTime: endTimeRoomOne,
        questionId: 1,
      },
    });
    await client.roomSession.create({
      data: {
        id: "2",
        startTime: startTimeRoomTwo,
        endTime: endTimeRoomTwo,
        questionId: 2,
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
        createdAt: endTimeRoomOne,
        updatedAt: endTimeRoomOne,
      },
    });
    await client.submission.create({
      data: {
        id: "2",
        roomSessionId: "2",
        status: Status.PENDING,
        language: Language.PYTHON,
        expectedOutput: "expectedOutput",
        code: "code",
        createdAt: endTimeRoomTwo,
        updatedAt: endTimeRoomTwo,
      },
    });
    await client.user.create({
      data: {
        id: 1,
        email: "janedoe@email.com",
        name: "Jane Doe",
        password: "password",
        roomSessions: {
          connect: [{ id: "1" }, { id: "2" }],
        },
      },
    });
    await client.user.create({
      data: {
        id: 2,
        email: "johndoe@email.com",
        name: "John Doe",
        password: "password",
        roomSessions: {
          connect: [{ id: "1" }, { id: "2" }],
        },
      },
    });
  });

  describe("GET /user/statistics", () => {
    it(`get default statistics`, async () => {
      const expected = {
        attemptSummary: { EASY: 1, MEDIUM: 1, HARD: 0 },
        durationSummary: [
          {
            difficulty: "MEDIUM",
            timetaken: 300,
            date: startTimeRoomOne.toJSON(),
          },
          {
            difficulty: "EASY",
            timetaken: 300,
            date: startTimeRoomTwo.toJSON(),
          },
        ],
        peerSummary: [
          {
            userName: "John Doe",
            questionTitle: "Integer Replacement",
            date: startTimeRoomOne.toJSON(),
          },
          {
            userName: "John Doe",
            questionTitle: "Remove Palindromic Subsequences",
            date: startTimeRoomTwo.toJSON(),
          },
        ],
        heatmapData: [
          { date: startTimeRoomOne.toJSON() },
          { date: startTimeRoomTwo.toJSON() },
        ],
        networkData: {
          topics: [
            { count: 1, id: 1, name: "Dynamic Programming" },
            { count: 1, id: 2, name: "Bit Manipulation" },
            { count: 1, id: 3, name: "Greedy" },
            { count: 2, id: 4, name: "Memoization" },
            { count: 1, id: 5, name: "Two Pointers" },
            { count: 1, id: 6, name: "String" },
          ],
          links: [
            { largeTopicId: 1, smallTopicId: 2 },
            { largeTopicId: 1, smallTopicId: 3 },
            { largeTopicId: 4, smallTopicId: 1 },
            { largeTopicId: 2, smallTopicId: 3 },
            { largeTopicId: 4, smallTopicId: 2 },
            { largeTopicId: 4, smallTopicId: 3 },
            { largeTopicId: 4, smallTopicId: 5 },
            { largeTopicId: 4, smallTopicId: 6 },
            { largeTopicId: 5, smallTopicId: 6 },
          ],
        },
      };
      const actual = await request(app.getHttpServer())
        .get("/user/statistics")
        .set("Authorization", "true")
        .set("user", "1")
        .expect(200);
      expect(actual.body).toStrictEqual(expected);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
