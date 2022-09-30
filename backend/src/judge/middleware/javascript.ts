import { CodeDetail, JudgeMiddleware } from "./middleware";

export class JavascriptMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getCodeDetail(): CodeDetail {
    const functionName = this.template.match(/var\s(\S*)/);
    const returnType = this.template.match(/@return\s{(.*)}/);

    if (!returnType || !functionName) {
      throw Error("Error parsing Javascript template code");
    }

    const argTypeRegex = /@param\s{(\S*)}/g;
    let argTypeMatches = null;
    const argTypes = [];
    while ((argTypeMatches = argTypeRegex.exec(this.template))) {
      argTypes.push(argTypeMatches[1]);
    }

    const varNameRegex = /@param.*}\s(\S+)/g;
    let varNameMatches = null;
    const variableNames = [];
    while ((varNameMatches = varNameRegex.exec(this.template))) {
      variableNames.push(varNameMatches[1]);
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
      variables += `const ${codeDetail.variableNames[i]} = ${this.inputs[i]};\n`;
    }

    const joinedVariableNames = codeDetail.variableNames.join(",");

    return `
${variables}
const result = ${codeDetail.functionName}(${joinedVariableNames});
console.log(result);
`;
  }
}
