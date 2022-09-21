import { Injectable } from "@nestjs/common";
import axios from "axios";
import { AxiosRequestConfig } from "axios";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ConfigService } from "src/core/config/config.service";

@Injectable()
export class JudgeService {
  constructor(
    @InjectPinoLogger(JudgeService.name)
    private readonly logger: PinoLogger,
    private configService: ConfigService,
  ) {}

  async sendRequest(
    languageId: number,
    code: string,
    stdin: string,
    expectedOutput: string,
  ): Promise<boolean> {
    this.logger.info("Sending code to Judge0...");
    const options: AxiosRequestConfig<string> = {
      method: "POST",
      url: `https://${this.configService.get("judge0.apiHost")}/submissions`,
      params: { wait: true, base64_encoded: true, fields: "*" },
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": this.configService.get("judge0.apiKey"),
        "X-RapidAPI-Host": this.configService.get("judge0.apiHost"),
      },
      data: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: stdin,
      }),
    };

    return axios
      .request(options)
      .then((response) => {
        this.logger.info(JSON.stringify(response.data));
        return response.data.stdout === expectedOutput;
      })
      .catch((error) => {
        this.logger.error(error);
        return false;
      });
  }
}
