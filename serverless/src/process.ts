import { Language } from "@prisma/client";
import { decode } from "html-entities";

import { ProcessedQuestion, Question } from "./types";

enum SUPPORTED_TYPES {
  BOOLEAN = "bool",
  INT = "int",
  DOUBLE = "double",
  FLOAT = "float",
  LONG = "long",
  LLONG = "long long",
  STRING = "string",
  VECTOR = "vector",
}

const getSupportedType = (
  type: string,
): SUPPORTED_TYPES | SUPPORTED_TYPES[] => {
  switch (type) {
    case SUPPORTED_TYPES.BOOLEAN: {
      return SUPPORTED_TYPES.BOOLEAN;
    }
    case SUPPORTED_TYPES.INT: {
      return SUPPORTED_TYPES.INT;
    }
    case SUPPORTED_TYPES.FLOAT: {
      return SUPPORTED_TYPES.FLOAT;
    }
    case SUPPORTED_TYPES.DOUBLE: {
      return SUPPORTED_TYPES.DOUBLE;
    }
    case SUPPORTED_TYPES.LONG: {
      return SUPPORTED_TYPES.LONG;
    }
    case SUPPORTED_TYPES.LLONG: {
      return SUPPORTED_TYPES.LLONG;
    }
    case SUPPORTED_TYPES.STRING: {
      return SUPPORTED_TYPES.STRING;
    }
    default: {
      return parseVectorType(type);
    }
  }
};

const parseVectorType = (type: string): SUPPORTED_TYPES[] => {
  const types = type.replace(/>/g, "").split("<");
  if (types.length < 2) {
    throw new Error(`Unsupported type [${types}]`);
  }
  for (let idx = 0; idx < types.length - 1; idx++) {
    if (types[idx] !== SUPPORTED_TYPES.VECTOR) {
      throw new Error(`Unsupported type [${types}]`);
    }
  }
  const finalType = Object.values(SUPPORTED_TYPES).find(
    (type) => type === types[types.length - 1],
  );
  if (!finalType) {
    throw new Error(`Unsupported type [${types}]`);
  }
  return types as SUPPORTED_TYPES[];
};

const extractOutput = (content: string) => {
  const trimmed = content
    .split(/<(?:strong|b)>\s*Output:?\s*<\/(?:strong|b)>\s*\n?/i, 2)[1]
    .split("\n", 1)[0]
    .trim();
  if (trimmed.indexOf("=") !== -1) {
    throw new Error("Unsupported result:");
  }
  const sanitized = decode(trimmed);
  return sanitized;
};

const extractCPPReturnType = (
  code: string,
): SUPPORTED_TYPES | SUPPORTED_TYPES[] => {
  const match = code.match(
    /class\s+Solution\s+{\s+public:\s+([&_a-zA-Z0-9<>*]*)\s+([*]?)/,
  );
  if (!match) {
    throw new Error("Unable to determine return type");
  }
  const returnType = match[1] + match[2];
  return getSupportedType(returnType);
};

const extractCPPArgumentType = (code: string) => {
  const match = code.match(
    /class\s+Solution\s+{\s+public:\s+(?:[&_a-zA-Z0-9<>*]*)\s+(?:[*]?)[a-zA-Z0-9]*\(([a-zA-Z0-9&*<>\s,]*)\)/,
  );
  if (!match) {
    throw new Error("Unable to determine arguments");
  }
  const rawArguments = match[1];
  const args = rawArguments
    .split(",")
    .map((argument) => argument.trim())
    .map((argument) => {
      const matches = argument.match(/([&|*| ])/g);
      if (!matches) {
        throw new Error("Unable to determine arguments");
      }
      const lastMatch = matches[matches.length - 1];
      const splits = argument.split(lastMatch);
      splits.pop();
      const type = splits.join() + lastMatch;
      return type.replace(/ /g, "").trim();
    });
  return args;
};

const validateSimpleType = (output: string, type: SUPPORTED_TYPES) => {
  switch (type) {
    case SUPPORTED_TYPES.BOOLEAN: {
      return output === "true" || output === "false";
    }
    case SUPPORTED_TYPES.INT:
    case SUPPORTED_TYPES.LONG:
    case SUPPORTED_TYPES.LLONG: {
      return !isNaN(parseInt(output, 10));
    }
    case SUPPORTED_TYPES.FLOAT:
    case SUPPORTED_TYPES.DOUBLE: {
      return !isNaN(Number(output));
    }
    case SUPPORTED_TYPES.STRING: {
      // This simple check should catch most cases.
      return output.startsWith('"') && output.endsWith('"');
    }
    default: {
      return false;
    }
  }
};

const validateVectorType = (output: string, type: SUPPORTED_TYPES[]) => {
  // We assume that the input is a valid vector.
  try {
    const object = JSON.parse(output);
    // Number of nested levels.
    let levels = type.length - 1;
    let check = [object];
    while (levels != 0) {
      const temp = [];
      for (const ukwn of check) {
        if (!Array.isArray(ukwn)) {
          return false;
        }
        temp.push(...ukwn);
      }
      check = temp;
      levels--;
    }
    for (const x of check) {
      if (!validateSimpleType(x, type[type.length - 1])) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
};

const validateOutputType = (
  output: string,
  type: SUPPORTED_TYPES | SUPPORTED_TYPES[],
): boolean => {
  if (typeof type === "string") {
    return validateSimpleType(output, type);
  }
  return validateVectorType(output, type);
};

export const isSupportedType = (type: string): boolean => {
  type = type.replace(/&|\*/, "");
  try {
    getSupportedType(type);
    return true;
  } catch {
    return false;
  }
};

export const cleanCodeSnippets = ({
  lang,
  code,
}: {
  lang: Language;
  code: string;
}): { lang: Language; code: string } => {
  return { lang, code: code.replace(/\n/g, "\r\n") };
};

export const process = async (
  questions: Question[],
): Promise<ProcessedQuestion[]> => {
  // Extract test cases
  const processed = questions.map((question) => {
    try {
      const output = extractOutput(question.content);
      const code = question.codeSnippets.find(
        (snippet) => snippet.lang === Language.CPP,
      )?.code;
      if (!code) {
        throw new Error("No C++ code found");
      }
      const returnType = extractCPPReturnType(code);
      if (!validateOutputType(output, returnType)) {
        throw new Error("Output type mismatch");
      }

      const args = extractCPPArgumentType(code);
      for (const arg of args) {
        if (!isSupportedType(arg)) {
          throw new Error(`Unsupported input type [${arg}]`);
        }
      }

      return {
        ...question,
        codeSnippets: question.codeSnippets.map((snippet) =>
          cleanCodeSnippets(snippet),
        ),
        testcase: { inputs: question.testcase.inputs, output },
      };
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.warn(`${e.message}: ${question.title}`);
      } else {
        console.warn(e);
      }
      return undefined;
    }
  });
  return processed.filter(
    (question) => question !== undefined,
  ) as ProcessedQuestion[];
};
