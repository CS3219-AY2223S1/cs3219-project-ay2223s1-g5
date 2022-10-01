import dedent from "dedent";

import { CodePrototype, JudgeMiddleware } from "./middleware";

export class CppMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
  }

  getImports(): string {
    return dedent`
      #include <algorithm>
      #include <cstdint>
      #include <limits>
      #include <set>
      #include <utility>
      #include <vector>
      #include <iostream>
      #include <sstream>
      #include <string>
      #include <iterator>
      #include <map>
      using namespace std;
    `;
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
    let variables = "";
    for (let i = 0; i < codePrototype.arguments.length; i++) {
      let input = this.inputs[i];

      // Check if input type is vector
      if (codePrototype.arguments[i].type.includes("vector")) {
        const argType = codePrototype.arguments[i].type.replace("&", "");
        // TODO: Handle nested vector case
        input = input.replace(/^\[/, "{");
        input = input.replace(/\]$/, "}");
        variables += `${argType} ${codePrototype.arguments[i].name}${input};\n`;
      } else {
        variables += `${codePrototype.arguments[i].type} ${codePrototype.arguments[i].name} = ${input};\n`;
      }
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(",");

    let printOutput;
    if (codePrototype.returnType.includes("vector")) {
      printOutput = dedent`
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

    return dedent`
      int main() {
        ${variables}
        ${codePrototype.returnType} res = Solution().${codePrototype.functionName}(${joinedVariableNames});
        ${printOutput}
      }
    `;
  }
}
