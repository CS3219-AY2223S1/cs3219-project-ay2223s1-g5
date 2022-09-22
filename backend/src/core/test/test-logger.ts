import { LoggerModule } from "nestjs-pino";

export const TestLoggerModule = LoggerModule.forRoot({
  pinoHttp: {
    customProps: () => ({ context: "NestApplication" }),
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode}: (${err.name}) ${err.message}`;
    },
    transport: {
      target: "pino-pretty",
      options: {
        sync: true,
        colorize: true,
      },
    },
  },
});
