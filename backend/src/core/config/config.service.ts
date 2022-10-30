import { Injectable } from "@nestjs/common";
import convict, { Config, Path } from "convict";
import * as dotenv from "dotenv";
import { join } from "path";

import { ConfigSchema, schema } from "./config.schema";

dotenv.config({ path: join(__dirname, "..", "..", "..", "..", ".env") });
@Injectable()
export class ConfigService {
  config: Config<ConfigSchema>;
  constructor() {
    this.config = convict(schema);
    this.config.validate();
  }

  // We want to implicitly use the return type of convict's get method
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get<K extends Path<ConfigSchema>>(key: K) {
    return this.config.get(key);
  }
}
