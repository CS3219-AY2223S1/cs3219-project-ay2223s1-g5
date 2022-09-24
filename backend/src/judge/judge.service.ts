import { Injectable } from "@nestjs/common";
import axios from "axios";
import { AxiosInstance } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";

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
    stdin: string,
    expectedOutput: string,
  ): Promise<boolean> {
    this.logger.info("Sending code to Judge0...");
    try {
      const response = await this.axiosInstance.post(
        "submissions",
        JSON.stringify({
          language_id: language,
          source_code: code,
          stdin: stdin,
        }),
      );

      this.logger.info(JSON.stringify(response.data));
      return response.data.stdout === expectedOutput;
    } catch (e: unknown) {
      this.logger.error(e);
      return false;
    }
  }
}
