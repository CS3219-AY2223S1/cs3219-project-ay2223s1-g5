import { addFormats, Schema } from "convict";

export interface ConfigSchema {
  port: number;
  environment: "development" | "staging" | "production" | "test";
  domain: string;
  session: {
    name: string;
    secret: string;
    maxAge: number;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    verificationSid: string;
    resetPasswordSid: string;
  };
  redis: {
    url: string;
  };
  judge0: {
    apiKey: string;
    apiHost: string;
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
  domain: {
    env: "DOMAIN",
    format: "required-string",
    default: "",
  },
  session: {
    name: {
      env: "SESSION_NAME",
      sensitive: false,
      default: "",
      format: "required-string",
    },
    secret: {
      env: "SESSION_SECRET",
      sensitive: true,
      default: "",
      format: "required-string",
    },
    maxAge: {
      env: "SESSION_MAX_AGE",
      format: Number,
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
    resetPasswordSid: {
      env: "TWILIO_RESET_PASSWORD_SID",
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
  judge0: {
    apiKey: {
      env: "JUDGE0_API_KEY",
      format: "required-string",
      default: "",
    },
    apiHost: {
      env: "JUDGE0_API_HOST",
      format: "required-string",
      default: "",
    },
  },
};
