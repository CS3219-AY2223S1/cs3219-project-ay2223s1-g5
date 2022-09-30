import { CodeDetail, JudgeMiddleware } from "./middleware";

export class JavaMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getCodeDetail(): CodeDetail {
    const returnType = this.template.match(/public\s(\S*)/);
    const functionName = this.template.match(/public.*\s(\S*)\(/);
    const argTypeWithVariableName = this.template.match(/public.*\((.*)\)/);

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing Java template code");
    }

    const arr = argTypeWithVariableName[1].split(",").map((e) => e.trim());
    const argTypes = [];
    const variableNames = [];
    for (const element of arr) {
      const [argType, varName] = element.split(" ").map((e) => e.trim());
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
      let input = this.inputs[i];

      // Check if input type is array
      if (codeDetail.argTypes[i].includes("[]")) {
        input = input.replace(/\[/g, "{");
        input = input.replace(/\]/g, "}");
      }
      variables += `${codeDetail.argTypes[i]} ${codeDetail.variableNames[i]} = ${input};`;
    }

    const joinedVariableNames = codeDetail.variableNames.join(",");
    const printOutput = codeDetail.returnType.includes("[]")
      ? "Arrays.toString(res)"
      : "res";

    return `
public class Main {
  public static void main(String[] args) {
    ${variables}
    Solution solution = new Solution();
    ${codeDetail.returnType} res = solution.${codeDetail.functionName}(${joinedVariableNames});
    System.out.println(${printOutput});
  }
}`;
  }
}
