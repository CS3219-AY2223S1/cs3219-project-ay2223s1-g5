import { CodePrototype, JudgeMiddleware } from "./middleware";

export class CppMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[], output: string) {
    super(template, inputs, output);
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
        input = input
          .replace(/^\[\[/g, "{{")
          .replace(/^\[/g, "{")
          .replace(/,\[/g, ",{")
          .replace(/\]\]$/g, "}}")
          .replace(/\]$/g, "}")
          .replace(/\],/g, "},");
        variables.push(
          `${argType} ${codePrototype.arguments[i].name}${input};`,
        );
      } else {
        variables.push(
          `${codePrototype.arguments[i].type} ${codePrototype.arguments[i].name} = ${input};`,
        );
      }
    }

    let expectedOutput = "";
    let isEqual = "";
    if (codePrototype.returnType.includes("vector")) {
      const output = this.output.replace(/^\[/, "{").replace(/\]$/, "}");
      expectedOutput = `${codePrototype.returnType} expectedOutput${output};`;
      isEqual =
        `bool isEqual = res.size() == expectedOutput.size() && ` +
        `std::equal(res.begin(), res.end(), expectedOutput.begin());`;
    } else {
      expectedOutput = `${codePrototype.returnType} expectedOutput = ${this.output};`;
      isEqual = "bool isEqual = res == expectedOutput;";
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(",");

    return (
      `int main() {\n` +
      variables.map((line) => `  ${line}`).join("\n") +
      `\n` +
      `  ${expectedOutput}\n` +
      `  ${codePrototype.returnType} res = Solution().${codePrototype.functionName}(${joinedVariableNames});\n` +
      `  ${isEqual}\n` +
      `  fprintf(stderr, "%s", isEqual ? "true" : "false");\n` +
      `}\n`
    );
  }
}
