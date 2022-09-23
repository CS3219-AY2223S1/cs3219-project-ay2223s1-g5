interface CodeDetail {
  functionName: string;
  argTypes: string[];
  variableNames: string[];
  returnType: string;
}

abstract class JudgeMiddleware {
  template: string;
  inputs: string[];
  output: string;

  constructor(template: string, inputs: string[], output: string) {
    this.template = template;
    this.inputs = inputs;
    this.output = output;
  }

  abstract getCodeDetail(): CodeDetail | null;
  abstract createEntryPoint(codeDetail: CodeDetail): string;
}
