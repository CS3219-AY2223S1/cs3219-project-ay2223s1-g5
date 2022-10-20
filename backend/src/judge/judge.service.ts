import { Injectable } from "@nestjs/common";
import { Language as PrismaLanguage, Status } from "@prisma/client";
import axios from "axios";
import { AxiosInstance } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { RateLimitError } from "src/common/errors/rate-limit.error";
import { ConfigService } from "src/core/config/config.service";
import { PrismaService } from "src/core/prisma.service";
import { QuestionService } from "src/question/question.service";
import { RedisService } from "src/redis/redis.service";

import { CppMiddleware } from "./middleware/cpp";
import { JavaMiddleware } from "./middleware/java";
import { JavascriptMiddleware } from "./middleware/javascript";
import { JudgeMiddleware } from "./middleware/middleware";
import { PythonMiddleware } from "./middleware/python";

import { Judge0Callback } from "~shared/types/api";
import { Language } from "~shared/types/base/index";

const secondsToMilliseconds = 1000;
const kilobytesToBytes = 1000;

const languageToLanguageId = (language: Language) => {
  switch (language) {
    case Language.CPP: {
      return 54;
    }
    case Language.JAVA: {
      return 62;
    }
    case Language.JAVASCRIPT: {
      return 63;
    }
    case Language.PYTHON: {
      return 71;
    }
  }
};

const statusIdToStatus = (status: number, output?: string) => {
  switch (status) {
    case 1:
    case 2: {
      return Status.PENDING;
    }
    case 3: {
      if (output?.toLowerCase().trim() === "true") {
        return Status.ACCEPTED;
      }
      if (output?.toLowerCase().trim() === "false") {
        return Status.WRONG_ANSWER;
      }
      return Status.RUNTIME_ERROR;
    }
    case 4: {
      return Status.WRONG_ANSWER;
    }
    case 5: {
      return Status.TIME_LIMIT_EXCEEDED;
    }
    case 6: {
      return Status.COMPILE_ERROR;
    }
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12: {
      return Status.RUNTIME_ERROR;
    }
    case 13:
    case 14: {
      return Status.INTERNAL_ERROR;
    }
  }
};

interface TestCase {
  inputs: string[];
  output: string;
}

@Injectable()
export class JudgeService {
  private static readonly NAMESPACE = "JUDGE";

  private axiosInstance: AxiosInstance;
  private domain: string;

  constructor(
    @InjectPinoLogger(JudgeService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly questionService: QuestionService,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: `https://${this.configService.get("judge0.apiHost")}/`,
      params: { base64_encoded: true, fields: "*" },
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.configService.get("judge0.apiKey"),
        "X-RapidAPI-Host": this.configService.get("judge0.apiHost"),
      },
    });
    this.domain = this.configService.get("domain");
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
    await this.redisService.setKey([JudgeService.NAMESPACE], roomId, "");

    this.logger.info("Sending code to Judge0...");
    const template = await this.getTemplate(questionId, language);
    const testCase = await this.getTestCase(questionId);
    const middleware = this.getMiddleware(
      language,
      template,
      testCase.inputs,
      testCase.output,
    );

    // Replace leading tabs with whitespaces
    let formattedCode = code
      .split("\n")
      .map((line) => line.replace(/\t/gy, "  "))
      .join("\n");
    formattedCode = middleware.getImports() + formattedCode;
    formattedCode += middleware.getEntryPoint();
    const encodedCode = this.encodeBase64(formattedCode);
    const response = await this.axiosInstance.post<{ token: string }>(
      "submissions",
      JSON.stringify({
        language_id: languageToLanguageId(language),
        source_code: encodedCode,
        callback_url: `${this.domain}/api/judge/callback`,
      }),
    );

    const token = response.data.token;

    await this.prismaService.submission.create({
      data: {
        id: token,
        roomSessionId: roomId,
        code,
        expectedOutput: "true", // TODO: Protect with randomised canary value.
        language: language.toUpperCase() as PrismaLanguage,
      },
    });

    return this.processResponse(token);
  }

  async handleCallback({ token }: Pick<Judge0Callback, "token">): Promise<{
    roomId: string;
    submissionId: string;
  } | null> {
    const submissionId = token;

    const { data } = await this.axiosInstance.get<Judge0Callback>(
      `/submissions/${submissionId}`,
    );

    this.redisService.setKey(
      [JudgeService.NAMESPACE, "SUBMISSION"],
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
      [JudgeService.NAMESPACE, "SUBMISSION"],
      submissionId,
    );
    if (!storedContent) {
      return null;
    }
    await this.redisService.deleteKey(
      [JudgeService.NAMESPACE, "SUBMISSION"],
      submissionId,
    );
    const content = JSON.parse(storedContent) as Judge0Callback;

    const time = Number(content.time) * secondsToMilliseconds;
    const memory = content.memory * kilobytesToBytes;

    const { roomSessionId: roomId } =
      await this.prismaService.submission.update({
        where: { id: submissionId },
        data: {
          runTime: time,
          memoryUsage: memory,
          output: content.stdout
            ? this.decodeBase64(content.stdout)
            : undefined,
          errorOutput: content.stderr
            ? this.decodeBase64(content.stderr)
            : undefined,
          compileOutput: content.compile_output
            ? this.decodeBase64(content.compile_output)
            : undefined,
          exitCode: content.exit_code,
          status: content.stderr
            ? statusIdToStatus(
                content.status.id,
                this.decodeBase64(content.stderr),
              )
            : statusIdToStatus(content.status.id),
        },
        select: {
          roomSessionId: true,
        },
      });

    this.redisService.deleteKey([JudgeService.NAMESPACE], roomId);

    return { roomId, submissionId };
  }

  private async hasSubmission(roomId: string): Promise<boolean> {
    return (
      (await this.redisService.getValue([JudgeService.NAMESPACE], roomId)) !=
      null
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

  private getMiddleware(
    language: Language,
    template: string,
    inputs: string[],
    output: string,
  ): JudgeMiddleware {
    switch (language) {
      case Language.JAVA:
        return new JavaMiddleware(template, inputs, output);
      case Language.JAVASCRIPT:
        return new JavascriptMiddleware(template, inputs, output);
      case Language.PYTHON:
        return new PythonMiddleware(template, inputs, output);
      case Language.CPP:
        return new CppMiddleware(template, inputs, output);
      default:
        throw Error("Language not supported yet");
    }
  }

  private encodeBase64(code: string): string {
    return Buffer.from(code, "binary").toString("base64");
  }

  private decodeBase64(code: string): string {
    return Buffer.from(code, "base64").toString("binary");
  }
}
