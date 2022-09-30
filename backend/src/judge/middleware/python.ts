import { CodeDetail, JudgeMiddleware } from "./middleware";

export class PythonMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getCodeDetail(): CodeDetail {
    const functionName = this.template.match(/def\s(\S*)\(/);
    const returnType = this.template.match(/->\s(\S*):/);
    const argTypeWithVariableName = this.template.match(/\(self,(.*)\)/);

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing Python template code");
    }

    const arr = argTypeWithVariableName[1].split(",").map((e) => e.trim());
    const argTypes = [];
    const variableNames = [];
    for (const element of arr) {
      const [varName, argType] = element.split(":").map((e) => e.trim());
      argTypes.push(argType);
      variableNames.push(varName);
    }

    return {
      argTypes,
      variableNames,
      functionName: functionName[1],
      returnType: returnType[1],
    };
  }

  createEntryPoint(codeDetail: CodeDetail): string {
    let variables = "";
    for (let i = 0; i < codeDetail.argTypes.length; i++) {
      variables += `${codeDetail.variableNames[i]} = ${this.inputs[i]}\n`;
    }

    const joinedVariableNames = codeDetail.variableNames.join(",");

    return `
${variables}
print(Solution().${codeDetail.functionName}(${joinedVariableNames}))
`;
  }
}
