export type Submission = {
  submitTime: Date | string;
  timeTaken: number;
  inputs: string[];
  expectedOutput: string;
  output: string;
  result: string;
};

export type GetSubmissionsRes = {
  submissions: Submission[];
};
