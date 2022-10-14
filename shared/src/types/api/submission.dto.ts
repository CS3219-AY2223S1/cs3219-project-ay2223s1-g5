export type Submission = {
  submitTime: string;
  timeTaken: string;
  expectedOutput: string;
  output: string;
  result: string;
};

export type GetSubmissionsRes = {
  submissions: Submission[];
};
