import { addFormats, Schema } from "convict";

export interface ConfigSchema {
  port: number;
  environment: "development" | "staging" | "production" | "test";
  jwt: {
    secret: string;
    validity: number;
  };
}

addFormats({
  "required-string": {
    validate: (value?: string): void => {
      if (value == undefined || value === "") {
        throw new Error("Required value cannot be empty");
      }
    },
  },
});

export const schema: Schema<ConfigSchema> = {
  port: {
    env: "PORT",
    format: "int",
    default: 8080,
  },
  environment: {
    env: "NODE_ENV",
    format: ["development", "staging", "production", "test"],
    default: "development",
  },
  jwt: {
    secret: {
      env: "JWT_SECRET",
      format: "required-string",
      default: "",
      sensitive: true,
    },
    validity: {
      env: "JWT_VALIDITY",
      format: "int",
      default: 604800000,
    },
  },
};
