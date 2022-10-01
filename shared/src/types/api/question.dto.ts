import { DifficultyLevel, Language } from "../base";

export class GetQuestionReq {
  difficultyLevel: DifficultyLevel;
}

export class GetQuestionRes {
  id: number;
  title: string;
  //   category: string;
  //   topics: string[];
  description: string;
  hints: string[];
  templates: { language: Language; code: string }[];
  testcases: { inputs: string[]; output: string }[];
}
