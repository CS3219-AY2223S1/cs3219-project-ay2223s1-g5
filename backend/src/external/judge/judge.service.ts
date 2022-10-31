import { Injectable } from "@nestjs/common";
import { Status } from "@prisma/client";
import axios from "axios";
import { AxiosInstance } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { InternalServerError } from "src/common/errors/internal-server.error";
import { ConfigService } from "src/core/config/config.service";

import { JudgeResponse } from "./judge.types";

import { Judge0Callback } from "~shared/types/api";
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

const parseStatus = (status: number) => {
  switch (status) {
    case 1:
    case 2:
    case 3: {
      return Status.PENDING;
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
    default: {
      return Status.INTERNAL_ERROR;
    }
  }
};

@Injectable()
export class JudgeService {
  private axiosInstance: AxiosInstance;
  private domain: string;

  constructor(
    @InjectPinoLogger(JudgeService.name)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
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

  async submit(
    language: Language,
    sourceCode: string,
  ): Promise<{
    submissionId: string;
  }> {
    const encodedCode = this.encodeBase64(sourceCode);
    this.logger.info("Submitting code to Judge0");
    const { data } = await this.axiosInstance.post<{ token: string }>(
      "submissions",
      JSON.stringify({
        language_id: languageToLanguageId(language),
        source_code: encodedCode,
        callback_url: `${this.domain}/api/submissions/callback`,
      }),
    );
    return { submissionId: data.token };
  }

  async retrieveSubmission(response: unknown): Promise<JudgeResponse> {
    if (!Object.prototype.hasOwnProperty.call(response, "token")) {
      throw new InternalServerError("Unexpected response in callback");
    }
    if (typeof (response as { token: unknown }).token !== "string") {
      throw new InternalServerError("Unexpected response in callback");
    }
    const submissionId = (response as { token: string }).token;
    const { data } = await this.axiosInstance.get<Judge0Callback>(
      `/submissions/${submissionId}`,
    );

    return this.decodeResponse(data);
  }

  private async decodeResponse(data: Judge0Callback): Promise<JudgeResponse> {
    const decodedStdOut = this.decodeBase64(data.stdout);
    const decodedstdErr = this.decodeBase64(data.stderr);
    const decodedCompileOutput = this.decodeBase64(data.compile_output);
    const status = parseStatus(data.status.id);
    return {
      submissionId: data.token,
      status,
      exitCode: data.exit_code ?? undefined,
      output: decodedStdOut,
      errorOutput: decodedstdErr,
      compileOutput: decodedCompileOutput,
      message: data.message ?? undefined,
      runTime: data.time ?? undefined,
      memoryUsage: data.memory ?? undefined,
    };
  }

  private encodeBase64(code: string | null): string | undefined {
    if (code === null) {
      return undefined;
    }
    return Buffer.from(code, "binary").toString("base64");
  }

  private decodeBase64(code: string | null): string | undefined {
    if (code === null) {
      return undefined;
    }
    return Buffer.from(code, "base64").toString("binary");
  }
}
