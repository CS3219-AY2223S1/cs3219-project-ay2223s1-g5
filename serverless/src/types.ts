import { Difficulty, Language } from "@prisma/client";

export type Question = {
  title: string;
  content: string;
  difficulty: Difficulty;
  categoryTitle: string;
  topicTags: { name: string }[];
  codeSnippets: {
    lang: Language;
    code: string;
  }[];
  hints: string[];
  testcase: {
    inputs: string[];
  };
};

export type ProcessedQuestion = Question & {
  testcase: {
    output: string;
  };
};
