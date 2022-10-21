export interface CodePrototype {
  functionName: string;
  arguments: { type: string; name: string }[];
  returnType: string;
}

export abstract class JudgeMiddleware {
  template: string;
  inputs: string[];
  output: string;
  canaryValue: string;

  constructor(
    template: string,
    inputs: string[],
    output: string,
    canaryValue: string,
  ) {
    this.template = template;
    this.inputs = inputs;
    this.output = output;
    this.canaryValue = canaryValue;
  }

  getEntryPoint() {
    const codePrototype = this.getCodePrototype();
    return this.createEntryPoint(codePrototype);
  }

  abstract getImports(): string;

  protected abstract getCodePrototype(): CodePrototype;
  protected abstract createEntryPoint(codePrototype: CodePrototype): string;
}
