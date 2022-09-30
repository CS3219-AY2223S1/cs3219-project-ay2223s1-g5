interface CodeDetail {
  functionName: string;
  argTypes: string[];
  variableNames: string[];
  returnType: string;
}

abstract class JudgeMiddleware {
  template: string;
  inputs: string[];

  constructor(template: string, inputs: string[]) {
    this.template = template;
    this.inputs = inputs;
  }

  getEntryPoint() {
    const codeDetail = this.getCodeDetail();
    return this.createEntryPoint(codeDetail);
  }

  abstract getCodeDetail(): CodeDetail;
  abstract createEntryPoint(codeDetail: CodeDetail): string;
}
