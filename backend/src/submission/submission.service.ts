import { Injectable } from "@nestjs/common";
import { Language as PrismaLanguage, Status } from "@prisma/client";
import { nanoid } from "nanoid";

import { REDIS_NAMESPACES } from "src/common/constants/namespaces";
import { EntityNotFoundError } from "src/common/errors/entity-not-found.error";
import { RateLimitError } from "src/common/errors/rate-limit.error";
import { PrismaService } from "src/core/prisma/prisma.service";
import { RedisService } from "src/core/redis/redis.service";
import { JudgeService } from "src/external/judge/judge.service";
import { JudgeResponse } from "src/external/judge/judge.types";
import { QuestionService } from "src/question/question.service";

import { SubmissionAdapter } from "./adapter/adapter";
import { CppAdapter } from "./adapter/cpp";
import { JavaAdapter } from "./adapter/java";
import { JavascriptAdapter } from "./adapter/javascript";
import { PythonAdapter } from "./adapter/python";

import { Language } from "~shared/types/base";

const secondsToMilliseconds = 1000;
const kilobytesToBytes = 1000;

const compareOutput = (output: string, expectedOutput: string) => {
  const expectedOutputArray = expectedOutput.trim().split("|");
  const expectedSecret = expectedOutputArray[0];
  const expectedResult = expectedOutputArray[1];

  const outputArray = output.trim().split(`${expectedSecret}|`);
  if (outputArray.length !== 2) {
    return Status.RUNTIME_ERROR;
  }

  if (outputArray[1] !== expectedResult) {
    return Status.WRONG_ANSWER;
  }

  return Status.ACCEPTED;
};

interface TestCase {
  inputs: string[];
  output: string;
}

@Injectable()
export class SubmissionService {
  constructor(
    private readonly judgeService: JudgeService,
    private readonly questionService: QuestionService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  async getSubmissionsByRoomId(roomId: string, userId: number) {
    const roomSession = await this.prismaService.roomSession.findFirst({
      where: { id: roomId, users: { some: { id: userId } } },
      include: {
        submissions: true,
      },
    });

    if (!roomSession) {
      throw new EntityNotFoundError("Room session not found.");
    }

    const { questionId, submissions } = roomSession;

    const filteredSubmissions = submissions.map((submission) => {
      const expectedOutput = submission.expectedOutput;
      const errorOutput = submission.errorOutput;
      const secret = expectedOutput.split("|")[0];
      const trueErrorOutput = errorOutput?.split(secret)[0];
      console.log(trueErrorOutput);
      return {
        ...submission,
        errorOutput: trueErrorOutput,
      };
    });

    return { questionId, submissions: filteredSubmissions };
  }

  async getTestCaseByQuestionId(questionId: number) {
    return await this.questionService.getTestcase(questionId);
  }

  async sendRequest(
    language: Language,
    code: string,
    questionId: number,
    roomId: string,
  ): Promise<{
    roomId: string;
    submissionId: string;
  } | null> {
    // FIXME: Solve race condition by using INCR.
    if (await this.hasSubmission(roomId)) {
      throw new RateLimitError("Processing previous submission.");
    }
    const secretValue = nanoid();
    await this.redisService.setKey(
      [REDIS_NAMESPACES.SUBMISSION, "ROOM"],
      roomId,
      "",
    );

    const template = await this.getTemplate(questionId, language);
    const testCase = await this.getTestCase(questionId);
    const middleware = this.getAdapter(
      language,
      template,
      testCase.inputs,
      testCase.output,
      secretValue,
    );

    // Replace leading tabs with whitespaces
    let formattedCode = code
      .split("\n")
      .map((line) => line.replace(/\t/gy, "  "))
      .join("\n");
    formattedCode = middleware.getImports() + formattedCode;
    formattedCode += middleware.getEntryPoint();
    try {
      const { submissionId } = await this.judgeService.submit(
        language,
        formattedCode,
      );
      await this.prismaService.submission.create({
        data: {
          id: submissionId,
          roomSessionId: roomId,
          code,
          expectedOutput: `${secretValue}|true`,
          language: language.toUpperCase() as PrismaLanguage,
        },
      });

      return this.processResponse(submissionId);
    } catch (e: unknown) {
      await this.redisService.deleteKey(
        [REDIS_NAMESPACES.SUBMISSION, "ROOM"],
        roomId,
      );
      throw e;
    }
  }

  async handleCallback(response: unknown): Promise<{
    roomId: string;
    submissionId: string;
  } | null> {
    const data = await this.judgeService.retrieveSubmission(response);

    const submissionId = data.submissionId;

    this.redisService.setKey(
      [REDIS_NAMESPACES.SUBMISSION, "SUBMISSION"],
      submissionId,
      JSON.stringify(data),
    );

    if (
      !(await this.prismaService.submission.findFirst({
        where: { id: submissionId },
      }))
    ) {
      return null;
    }
    // We are sure that the submission already exists and we can process it.
    return this.processResponse(submissionId);
  }

  private async processResponse(
    submissionId: string,
  ): Promise<{ roomId: string; submissionId: string } | null> {
    const storedContent = await this.redisService.getValue(
      [REDIS_NAMESPACES.SUBMISSION, "SUBMISSION"],
      submissionId,
    );
    if (!storedContent) {
      return null;
    }
    await this.redisService.deleteKey(
      [REDIS_NAMESPACES.SUBMISSION, "SUBMISSION"],
      submissionId,
    );
    const content = JSON.parse(storedContent) as JudgeResponse;

    const storedSubmission = await this.prismaService.submission.findFirst({
      where: { id: submissionId },
    });
    const expectedOutput = storedSubmission?.expectedOutput;

    let status = content.status;
    if (status === Status.PENDING && content.errorOutput && expectedOutput) {
      status = compareOutput(content.errorOutput, expectedOutput);
    } else if (!expectedOutput) {
      status = Status.INTERNAL_ERROR;
    }

    const time = content.runTime
      ? Number(content.runTime) * secondsToMilliseconds
      : undefined;
    const memory = content.memoryUsage
      ? content.memoryUsage * kilobytesToBytes
      : undefined;

    const { roomSessionId: roomId } =
      await this.prismaService.submission.update({
        where: { id: submissionId },
        data: {
          runTime: time,
          memoryUsage: memory,
          output: content.output,
          errorOutput: content.errorOutput,
          compileOutput: content.compileOutput,
          exitCode: content.exitCode,
          status,
        },
        select: {
          roomSessionId: true,
        },
      });

    this.redisService.deleteKey([REDIS_NAMESPACES.SUBMISSION, "ROOM"], roomId);

    return { roomId, submissionId };
  }

  private async hasSubmission(roomId: string): Promise<boolean> {
    return (
      (await this.redisService.getValue(
        [REDIS_NAMESPACES.SUBMISSION, "ROOM"],
        roomId,
      )) != null
    );
  }

  private async getTemplate(
    questionId: number,
    language: Language,
  ): Promise<string> {
    const template = await this.questionService.getSolutionTemplateByLanguage(
      questionId,
      language,
    );

    if (!template) {
      throw Error(`Template not found for question ${questionId}`);
    }

    return template.code;
  }

  private async getTestCase(questionId: number): Promise<TestCase> {
    const testCase = await this.questionService.getTestcase(questionId);

    if (!testCase) {
      throw Error(`Testcase for question ${questionId} not found`);
    }

    return {
      inputs: testCase.inputs,
      output: testCase.output,
    } as TestCase;
  }

  private getAdapter(
    language: Language,
    template: string,
    inputs: string[],
    output: string,
    secretValue: string,
  ): SubmissionAdapter {
    switch (language) {
      case Language.JAVA:
        return new JavaAdapter(template, inputs, output, secretValue);
      case Language.JAVASCRIPT:
        return new JavascriptAdapter(template, inputs, output, secretValue);
      case Language.PYTHON:
        return new PythonAdapter(template, inputs, output, secretValue);
      case Language.CPP:
        return new CppAdapter(template, inputs, output, secretValue);
      default:
        throw Error("Language not supported yet");
    }
  }
}
