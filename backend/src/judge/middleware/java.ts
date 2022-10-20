import { CodePrototype, JudgeMiddleware } from "./middleware";

const primitiveTypes = [
  "int",
  "byte",
  "short",
  "long",
  "float",
  "double",
  "boolean",
  "char",
];

export class JavaMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[], output: string) {
    super(template, inputs, output);
  }

  getImports(): string {
    return (
      "import java.util.*;\n" +
      "import java.lang.*;\n" +
      "import java.util.stream.*;\n"
    );
  }

  protected getCodePrototype(): CodePrototype {
    const returnType = this.template.match(/public\s(\S*)/);
    const functionName = this.template.match(/public.*\s(\S*)\(/);
    const argTypeWithVariableName = this.template.match(/public.*\((.*)\)/);

    if (!returnType || !functionName || !argTypeWithVariableName) {
      throw Error("Error parsing Java template code");
    }

    const arr = argTypeWithVariableName[1].split(",").map((e) => e.trim());
    const argumentArr = [];
    for (const element of arr) {
      const [type, name] = element.split(" ").map((e) => e.trim());
      argumentArr.push({ type, name });
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

      // Check if input type is array
      if (codePrototype.arguments[i].type.includes("[]")) {
        input = input
          .replace(/^\[\[/g, "{{")
          .replace(/^\[/g, "{")
          .replace(/,\[/g, ",{")
          .replace(/\]\]$/g, "}}")
          .replace(/\]$/g, "}")
          .replace(/\],/g, "},");
      }
      variables.push(
        `${codePrototype.arguments[i].type} ${codePrototype.arguments[i].name} = ${input};`,
      );
    }

    let expectedOutput = "";
    let isEqual = "";
    if (codePrototype.returnType.includes("[]")) {
      const output = this.output.replace(/^\[/, "{").replace(/\]$/, "}");
      expectedOutput = `${codePrototype.returnType} expectedOutput = ${output};`;
      isEqual = `boolean isEqual = Arrays.equals(res, expectedOutput);`;
    } else if (
      primitiveTypes.some((type) => type === codePrototype.returnType)
    ) {
      expectedOutput = `${codePrototype.returnType} expectedOutput = ${this.output};`;
      isEqual = "boolean isEqual = res == expectedOutput;";
    } else {
      expectedOutput = `${codePrototype.returnType} expectedOutput = ${this.output};`;
      isEqual =
        "boolean isEqual = res.toString().equals(expectedOuput.toString());";
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(",");

    return (
      `public class Main {\n` +
      `  public static void main(String[] args) {\n` +
      variables.map((line) => `    ${line}`).join("\n") +
      `\n` +
      `    Solution solution = new Solution();\n` +
      `    ${expectedOutput}\n` +
      `    ${codePrototype.returnType} res = solution.${codePrototype.functionName}(${joinedVariableNames});\n` +
      `    ${isEqual}\n` +
      `    System.err.print(isEqual ? "True" : "False");\n` +
      `  }\n` +
      `}\n`
    );
  }
}
