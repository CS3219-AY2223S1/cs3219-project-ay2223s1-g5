import { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { Language as PrismaLanguage } from "@prisma/client";
import { createClient, RedisClientType } from "@redis/client";
import { LoggerModule } from "nestjs-pino";
import { io, Socket } from "socket.io-client";

import { AuthModule } from "src/auth/auth.module";
import { SessionSocketAdapter } from "src/common/adapters/session.websocket.adapter";
import { MockSessionMiddleware } from "src/common/middlewares/test/MockSessionMiddleware";
import { CoreModule } from "src/core/core.module";
import { TestClient } from "src/core/test/test-client";
import { JudgeService } from "src/external/judge/judge.service";
import { RoomService } from "src/room/room.service";

import { SubmissionModule } from "../submission.module";
import { SubmissionService } from "../submission.service";

import { ROOM_EVENTS } from "~shared/constants";
import { Difficulty, Language } from "~shared/types/base/index";

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
        language: PrismaLanguage.CPP,
        code:
          "class Solution {\n" +
          "public:\n" +
          "  vector<int> twoSum(vector<int>& nums, int target) {\n" +
          "  }" +
          "};\n",
      },
    ],
  },
  testcases: {
    create: [
      {
        inputs: ["[2,7,11,15]", "9"],
        output: "[0, 1]",
      },
    ],
  },
};

describe("Submission", () => {
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
        SubmissionModule,
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
    await client.question.create({ data: questionFixture });
    await redisClient.flushAll();
  });

  describe("Submissions", () => {
    let clientSocket1: Socket;
    let clientSocket2: Socket;

    const mockRoomId = "mockRoomId";
    const mockSubmissionId = "mockSubmissionId";
    const defaultPayload = {
      code: "code\n",
      questionId: 1,
      language: Language.CPP,
    };

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
      clientSocket1.emit(ROOM_EVENTS.SUBMIT, defaultPayload);
      clientSocket2.on(ROOM_EVENTS.SUBMISSION_ACCEPTED, () => {
        done();
      });
    });

    it("should not allow multiple submissions together", (done) => {
      jest
        .spyOn(SubmissionService.prototype as any, "hasSubmission")
        .mockReturnValue(Promise.resolve(true));

      clientSocket1.emit(ROOM_EVENTS.SUBMIT, defaultPayload);

      clientSocket1.on(ROOM_EVENTS.SUBMISSION_REJECTED, ({ reason }) => {
        expect(reason).toBe("Processing previous submission.");
        done();
      });
    });

    it("should format code for submission", (done) => {
      const middlewareSpy = jest.spyOn(
        SubmissionService.prototype as any,
        "getMiddleware",
      );
      const judgeSpy = jest
        .spyOn(JudgeService.prototype, "submit")
        .mockRejectedValue(new Error());

      clientSocket1.emit(ROOM_EVENTS.SUBMIT, defaultPayload);

      clientSocket1.on(ROOM_EVENTS.SUBMISSION_REJECTED, () => {
        const secretValue = middlewareSpy.mock.calls[0][4];
        const expectedCode =
          "code\n" +
          "int main() {\n" +
          "  vector<int> nums{2,7,11,15};\n" +
          "  int target = 9;\n" +
          "  vector<int> expectedOutput{0, 1};\n" +
          "  vector<int> res = Solution().twoSum(nums,target);\n" +
          "  bool isEqual = res.size() == expectedOutput.size() && std::equal(res.begin(), res.end(), expectedOutput.begin());\n" +
          `  fprintf(stderr, "${secretValue}|%s", isEqual ? "true" : "false");\n` +
          "}\n";
        expect(judgeSpy.mock.calls[0][1]).toContain(expectedCode);
        done();
      });
    });

    it("should return update submission", (done) => {
      const submissionSpy = jest
        .spyOn(SubmissionService.prototype, "sendRequest")
        .mockReturnValue(
          Promise.resolve({
            roomId: mockRoomId,
            submissionId: mockSubmissionId,
          }),
        );

      clientSocket1.emit(ROOM_EVENTS.SUBMIT, defaultPayload);

      clientSocket1.on(ROOM_EVENTS.SUBMISSION_UPDATED, ({ submissionId }) => {
        expect(submissionSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code\n",
          1,
          mockRoomId,
        );
        expect(submissionId).toBe(mockSubmissionId);
        done();
      });
    });

    it("should return submission rejected", (done) => {
      const errorReason = "send request fail";
      const submissionSpy = jest
        .spyOn(SubmissionService.prototype, "sendRequest")
        .mockRejectedValue(new Error(errorReason));

      clientSocket1.emit(ROOM_EVENTS.SUBMIT, defaultPayload);

      clientSocket1.on(ROOM_EVENTS.SUBMISSION_REJECTED, ({ reason }) => {
        expect(submissionSpy).toHaveBeenCalledWith(
          Language.CPP,
          "code\n",
          1,
          mockRoomId,
        );
        expect(reason).toBe(errorReason);
        done();
      });
    });
  });

  afterAll(async () => {
    app.getHttpServer().close();
    await app.close();
    await adapter.deactivate();
    await redisClient.disconnect();
  });
});
