import { CodePrototype, SubmissionAdapter } from "./adapter";

export class PythonAdapter extends SubmissionAdapter {
  constructor(
    template: string,
    inputs: string[],
    output: string,
    canaryValue: string,
  ) {
    super(template, inputs, output, canaryValue);
  }

  getImports(): string {
    return (
      "from typing import List\n" +
      "import collections\n" +
      "import math\n" +
      "import random\n" +
      "import sys\n"
    );
  }

  protected getCodePrototype(): CodePrototype {
    const functionName = this.template.match(/def\s(\S*)\(/);
    const returnType = this.template.match(/->\s(\S*):/);
    const argTypeWithVariableName = this.template.match(/\(self,(.*)\)/);

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing Python template code");
    }

    const arr = argTypeWithVariableName[1].split(",").map((e) => e.trim());
    const argumentArr = [];
    for (const element of arr) {
      const [varName, argType] = element.split(":").map((e) => e.trim());
      argumentArr.push({ type: argType, name: varName });
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
      variables.push(`${codePrototype.arguments[i].name} = ${this.inputs[i]}`);
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(", ");

    let formattedOutput = this.output;
    if (codePrototype.returnType.includes("bool")) {
      formattedOutput = formattedOutput
        .replace(/true/g, "True")
        .replace(/false/g, "False");
    }

    return (
      `\n` +
      variables.join("\n") +
      `\n` +
      `if (Solution().${codePrototype.functionName}(${joinedVariableNames}) == ${formattedOutput}):\n` +
      `  print("${this.canaryValue}|true", file=sys.stderr)\n` +
      `else:\n` +
      `  print("${this.canaryValue}|false", file=sys.stderr)\n`
    );
  }
}
