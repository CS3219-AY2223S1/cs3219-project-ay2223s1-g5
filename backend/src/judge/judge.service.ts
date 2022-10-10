import { Injectable } from "@nestjs/common";
import axios from "axios";
import { AxiosInstance } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";
import { QuestionService } from "src/question/question.service";
import { RedisService } from "src/redis/redis.service";

import { CppMiddleware } from "./middleware/cpp";
import { JavaMiddleware } from "./middleware/java";
import { JavascriptMiddleware } from "./middleware/javascript";
import { JudgeMiddleware } from "./middleware/middleware";
import { PythonMiddleware } from "./middleware/python";

import { Language } from "~shared/types/base/index";

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

interface TestCase {
  inputs: string[];
  output: string;
}

@Injectable()
export class JudgeService {
  private static readonly NAMESPACE = "JUDGE";

  private axiosInstance: AxiosInstance;

  constructor(
    @InjectPinoLogger(JudgeService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly questionService: QuestionService,
    private readonly redisService: RedisService,
  ) {
    this.axiosInstance = axios.create({
      baseURL: `https://${this.configService.get("judge0.apiHost")}/`,
      // TODO: Use "wait: false" and provide callback url
      params: { wait: true, base64_encoded: true, fields: "*" },
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.configService.get("judge0.apiKey"),
        "X-RapidAPI-Host": this.configService.get("judge0.apiHost"),
      },
    });
  }

  async sendRequest(
    language: Language,
    code: string,
    questionId: number,
    roomId: string,
  ): Promise<boolean> {
    this.logger.info("Sending code to Judge0...");
    await this.redisService.setKey([JudgeService.NAMESPACE], roomId, "");

    try {
      const template = await this.getTemplate(questionId, language);
      const testCase = await this.getTestCase(questionId);
      const middleware = this.getMiddleware(
        language,
        template,
        testCase.inputs,
        testCase.output,
      );

      // Replace leading tabs with whitespaces
      code = code
        .split("\n")
        .map((line) => line.replace(/\t/gy, "  "))
        .join("\n");
      code = middleware.getImports() + code;
      code += middleware.getEntryPoint();
      const encodedCode = this.encodeBase64(code);
      const response = await this.axiosInstance.post(
        "submissions",
        JSON.stringify({
          language_id: languageToLanguageId(language),
          source_code: encodedCode,
        }),
      );

      await this.redisService.deleteKey([JudgeService.NAMESPACE], roomId);

      if (!response.data.stdout) {
        return false;
      }

      const decodedOutput = this.decodeBase64(response.data.stdout);
      return decodedOutput.trim().toLowerCase() === "true";
    } catch (e: unknown) {
      this.logger.error(e);
      return false;
    }
  }

  async hasSubmission(roomId: string): Promise<boolean> {
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
