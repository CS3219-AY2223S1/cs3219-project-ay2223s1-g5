import { CodePrototype, JudgeMiddleware } from "./middleware";

export class JavaMiddleware extends JudgeMiddleware {
  constructor(template: string, inputs: string[]) {
    super(template, inputs);
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
          .replace(/\s\[/g, " {")
          .replace(/\]\]$/g, "}}")
          .replace(/\]$/g, "}")
          .replace(/\],/g, "},");
      }
      variables.push(
        `${codePrototype.arguments[i].type} ${codePrototype.arguments[i].name} = ${input};`,
      );
    }

    const joinedVariableNames = codePrototype.arguments
      .map((arg) => arg.name)
      .join(",");

    const printOutput = codePrototype.returnType.includes("[]")
      ? "Arrays.toString(res)"
      : "res";

    return (
      `public class Main {\n` +
      `  public static void main(String[] args) {\n` +
      variables.map((line) => `  ${line}`).join("\n") +
      `\n` +
      `    Solution solution = new Solution();\n` +
      `    ${codePrototype.returnType} res = solution.${codePrototype.functionName}(${joinedVariableNames});\n` +
      `    System.out.print(${printOutput});\n` +
      `  }\n` +
      `}\n`
    );
  }
}
