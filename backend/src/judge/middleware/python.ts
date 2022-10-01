import dedent from "dedent";

import { CodePrototype, JudgeMiddleware } from "./middleware";

export class PythonMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getImports(): string {
    return dedent`
      from typing import List
      import collections
      import math
      import random
    `;
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
    let variables = "";
    for (let i = 0; i < codePrototype.arguments.length; i++) {
      variables += `${codePrototype.arguments[i].name} = ${this.inputs[i]}\n`;
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(", ");

    return `
${variables}
print(Solution().${codePrototype.functionName}(${joinedVariableNames}))
`;
  }
}
