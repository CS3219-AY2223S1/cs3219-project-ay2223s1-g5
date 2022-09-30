import { CodeDetail, JudgeMiddleware } from "./middleware";

export class CppMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getCodeDetail(): CodeDetail {
    const returnType = this.template.match(/public:\s*(\S*)/);
    const functionName = this.template.match(/\s(\S*)\(/);
    const argTypeWithVariableName = this.template.match(/\((.*)\)/);
    if (!returnType) {
      throw Error("No return type");
    }
    if (!functionName) {
      throw Error("No func name");
    }
    if (!argTypeWithVariableName) {
      throw Error("No arg var");
    }

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing CPP template code");
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

      // Check if input type is vector
      if (codeDetail.argTypes[i].includes("vector")) {
        const argType = codeDetail.argTypes[i].replace("&", "");
        input = input.replace(/\[/g, "{");
        input = input.replace(/\]/g, "}");
        variables += `${argType} ${codeDetail.variableNames[i]}${input};\n`;
      } else {
        variables += `${codeDetail.argTypes[i]} ${codeDetail.variableNames[i]} = ${input};\n`;
      }
    }

    const joinedVariableNames = codeDetail.variableNames.join(",");
    let printOutput;
    if (codeDetail.returnType.includes("vector")) {
      printOutput = `
std::stringstream ss;
ss << "[";
for (size_t i = 0; i < res.size(); i++) {
  if (i != 0) {
    ss << ", ";
  }
  ss << res[i];
}
ss << "]";
std::cout << ss.str() << std::endl;
`;
    } else {
      printOutput = `std::cout << res << std::endl;`;
    }

    return `
int main() {
  ${variables}
  ${codeDetail.returnType} res = Solution().${codeDetail.functionName}(${joinedVariableNames});
  ${printOutput}
}`;
  }
}
