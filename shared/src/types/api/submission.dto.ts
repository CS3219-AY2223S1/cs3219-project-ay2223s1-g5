import { Status } from "../base";

export type Submission = {
  submitTime: Date | string;
  status: Status;
  code: string;
  inputs: string[];
  expectedOutput: string;
  runTime?: number;
  memoryUsage?: number;
  standardOutput?: string;
  errorOutput?: string;
  compileOutput?: string;
};

export type GetSubmissionsRes = {
  submissions: Submission[];
};
