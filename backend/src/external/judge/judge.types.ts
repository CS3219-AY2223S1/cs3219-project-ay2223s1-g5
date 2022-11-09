import { Status } from "@prisma/client";

export type JudgeResponse = {
  submissionId: string;
  exitCode?: number;
  output?: string;
  errorOutput?: string;
  compileOutput?: string;
  message?: string;
  runTime?: string;
  memoryUsage?: number;
  status: Status;
};
