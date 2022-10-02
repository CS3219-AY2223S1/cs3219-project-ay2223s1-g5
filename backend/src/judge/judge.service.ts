import { Injectable } from "@nestjs/common";
import axios from "axios";
import { AxiosInstance } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";

import { JavaMiddleware } from "./middleware/java";
import { JudgeMiddleware } from "./middleware/middleware";

import { Language } from "~shared/types/base/index";

@Injectable()
export class JudgeService {
  private axiosInstance: AxiosInstance;

  constructor(
    @InjectPinoLogger(JudgeService.name)
    private readonly logger: PinoLogger,
    private configService: ConfigService,
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
    template: string,
    inputs: string[],
    expectedOutput: string,
  ): Promise<boolean> {
    this.logger.info("Sending code to Judge0...");
    try {
      const middleware = this.getMiddleware(language, template, inputs);
      code = middleware.getImports() + code;
      code += middleware.getEntryPoint();
      const encodedCode = this.encodeBase64(code);
      this.logger.info(code);
      const response = await this.axiosInstance.post(
        "submissions",
        JSON.stringify({
          language_id: language,
          source_code: encodedCode,
        }),
      );

      this.logger.info(JSON.stringify(response.data));

      const decodedOutput = this.decodeBase64(response.data.stdout);
      this.logger.info(`Judge0 output: ${decodedOutput}`);
      return decodedOutput === expectedOutput;
    } catch (e: unknown) {
      this.logger.error(e);
      return false;
    }
  }

  private getMiddleware(
    language: Language,
    template: string,
    inputs: string[],
  ): JudgeMiddleware {
    switch (language) {
      case Language.JAVA:
        return new JavaMiddleware(template, inputs);
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
