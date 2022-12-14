import { CodePrototype, SubmissionAdapter } from "./adapter";

export class JavascriptAdapter extends SubmissionAdapter {
  constructor(
    template: string,
    inputs: string[],
    output: string,
    canaryValue: string,
  ) {
    super(template, inputs, output, canaryValue);
  }

  getImports(): string {
    return "";
  }

  protected getCodePrototype(): CodePrototype {
    const functionName = this.template.match(/var\s(\S*)/);
    const returnType = this.template.match(/@return\s{(.*)}/);

    if (!returnType || !functionName) {
      throw Error("Error parsing Javascript template code");
    }

    const argumentRegex = /@param\s{(\S*)}\s(\S*)/g;
    let argumentMatches = null;
    const argumentArr = [];
    while ((argumentMatches = argumentRegex.exec(this.template))) {
      argumentArr.push({ type: argumentMatches[1], name: argumentMatches[2] });
    }

    return {
      arguments: argumentArr,
      functionName: functionName[1],
      returnType: returnType[1],
    };
  }

  protected createEntryPoint(codePrototype: CodePrototype): string {
    const variables = [];
    for (let i = 0; i < codePrototype.arguments.length; i++) {
      variables.push(
        `const ${codePrototype.arguments[i].name} = ${this.inputs[i]};`,
      );
    }

    const isEqual =
      "const isEqual = JSON.stringify(result) === JSON.stringify(expectedOutput);";

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(", ");

    return (
      `\n` +
      variables.join("\n") +
      `\n` +
      `const expectedOutput = ${this.output};\n` +
      `const result = ${codePrototype.functionName}(${joinedVariableNames});\n` +
      `${isEqual}\n` +
      `console.error(isEqual ? "${this.canaryValue}|true" : "${this.canaryValue}|false");\n`
    );
  }
}
