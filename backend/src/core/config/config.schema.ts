import { addFormats, Schema } from "convict";

export interface ConfigSchema {
  port: number;
  environment: "development" | "staging" | "production" | "test";
  jwt: {
    secret: string;
    validity: number;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    verificationSid: string;
  };
  redis: {
    url: string;
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
  twilio: {
    accountSid: {
      env: "TWILIO_ACCOUNT_SID",
      format: "required-string",
      default: "",
      sensitive: true,
    },
    authToken: {
      env: "TWILIO_AUTH_TOKEN",
      format: "required-string",
      default: "",
      sensitive: true,
    },
    verificationSid: {
      env: "TWILIO_VERIFICATION_SID",
      format: "required-string",
      default: "",
      sensitive: true,
    },
  },
  redis: {
    url: {
      env: "REDIS_URL",
      format: "required-string",
      default: "",
    },
  },
};
