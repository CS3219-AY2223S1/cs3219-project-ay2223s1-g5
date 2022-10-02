import { CodePrototype, JudgeMiddleware } from "./middleware";

export class CppMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getImports(): string {
    return (
      "#include <algorithm>\n" +
      "#include <cstdint>\n" +
      "#include <limits>\n" +
      "#include <set>\n" +
      "#include <utility>\n" +
      "#include <vector>\n" +
      "#include <iostream>\n" +
      "#include <sstream>\n" +
      "#include <string>\n" +
      "#include <iterator>\n" +
      "#include <map>\n" +
      "using namespace std;\n"
    );
  }

  protected getCodePrototype(): CodePrototype {
    const returnType = this.template.match(/public:\s*(\S*)/);
    const functionName = this.template.match(/\s(\S*)\(/);
    const argTypeWithVariableName = this.template.match(/\((.*)\)/);

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing CPP template code");
    }

    const arr = argTypeWithVariableName[1].split(",").map((e) => e.trim());
    const argumentArr = [];
    for (const element of arr) {
      const [argType, varName] = element.split(" ").map((e) => e.trim());
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
      let input = this.inputs[i];

      // Check if input type is vector
      if (codePrototype.arguments[i].type.includes("vector")) {
        const argType = codePrototype.arguments[i].type.replace("&", "");
        // TODO: Handle nested vector case
        input = input.replace(/^\[/, "{");
        input = input.replace(/\]$/, "}");
        variables.push(
          `${argType} ${codePrototype.arguments[i].name}${input};`,
        );
      } else {
        variables.push(
          `${codePrototype.arguments[i].type} ${codePrototype.arguments[i].name} = ${input};`,
        );
      }
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(",");

    let printOutput;
    if (codePrototype.returnType.includes("vector")) {
      printOutput =
        `  std::stringstream ss;\n` +
        `  ss << "[";\n` +
        `  for (size_t i = 0; i < res.size(); i++) {\n` +
        `    if (i != 0) {\n` +
        `      ss << ", ";\n` +
        `    }\n` +
        `    ss << res[i];\n` +
        `  }\n` +
        `  ss << "]";\n` +
        `  std::cout << ss.str() << std::endl;\n`;
    } else {
      printOutput = "std::cout << res << std::endl;";
    }

    return (
      `int main() {\n` +
      variables.map((line) => `  ${line}`).join("\n") +
      `\n` +
      `  ${codePrototype.returnType} res = Solution().${codePrototype.functionName}(${joinedVariableNames});\n` +
      `${printOutput}\n` +
      `}\n`
    );
  }
}
