export type Judge0Callback = {
  token: string;
  exit_code: number;
  stdout: string;
  stderr: string;
  compile_output: string;
  message: string;
  time: string;
  memory: number;
  status: {
    id: number;
    description: string;
  };
};
