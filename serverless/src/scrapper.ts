import { Difficulty, Language } from "@prisma/client";
import axios from "axios";
import rateLimit from "axios-rate-limit";

import { Question } from "./types";

const ALGORITHMS_LIST_ENDPOINT =
  "https://leetcode.com/api/problems/algorithms/";
const GRAPHQL_ENDPOINT = "https://leetcode.com/graphql/";

type AlgorihtmsListResponse = {
  stat_status_pairs: {
    stat: {
      question__title_slug: string;
    };
    paid_only: boolean;
  }[];
};

type GraphQLResponse = {
  data: {
    question: {
      title: string;
      content: string;
      difficulty: string;
      similarQuestions: string;
      exampleTestCases: string;
      categoryTitle: string;
      topicTags: { name: string }[];
      codeSnippets: {
        lang: string;
        code: string;
      }[];
      hints: string[];
      sampleTestCase: string;
    };
  };
};

const parseDifficulty = (difficulty: string) => {
  switch (difficulty) {
    case "Easy": {
      return Difficulty.EASY;
    }
    case "Medium": {
      return Difficulty.MEDIUM;
    }
    case "Hard": {
      return Difficulty.HARD;
    }
    default: {
      throw new Error(`Unexpected difficulty encountered: ${difficulty}`);
    }
  }
};

const parseCodeSnippets = (
  input: {
    lang: string;
    code: string;
  }[],
) => {
  const codeSnippets = [];
  for (const snippet of input) {
    let language: Language | undefined = undefined;
    switch (snippet.lang) {
      case "C++": {
        language = Language.CPP;
        break;
      }
      case "Java": {
        language = Language.JAVA;
        break;
      }
      case "Python3": {
        language = Language.PYTHON;
        break;
      }
      case "JavaScript": {
        language = Language.JAVASCRIPT;
        break;
      }
    }
    if (!language) {
      continue;
    }
    codeSnippets.push({
      lang: language,
      code: snippet.code,
    });
  }
  return codeSnippets;
};

export const scrapper = async () => {
  const axiosInstance = rateLimit(axios.create(), { maxRPS: 5 });

  const { data } = await axiosInstance.get<AlgorihtmsListResponse>(
    ALGORITHMS_LIST_ENDPOINT,
  );
  const questions: Question[] = [];
  const promises: Promise<void>[] = [];
  for (const entry of data.stat_status_pairs) {
    if (entry.paid_only) {
      continue;
    }
    const payload = {
      operationName: "questionData",
      query: `query questionData($titleSlug: String!) {
                  question(titleSlug: $titleSlug) {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    content
                    difficulty
                    similarQuestions
                    exampleTestcases
                    categoryTitle
                    topicTags {
                      name
                    }
                    companyTagStats
                    codeSnippets {
                      lang
                      code
                    }
                    hints
                    sampleTestCase
                  }
                }`,
      variables: {
        titleSlug: entry.stat.question__title_slug,
      },
    };

    const promise = axiosInstance
      .get<GraphQLResponse>(GRAPHQL_ENDPOINT, {
        data: payload,
      })
      .then((value) => value.data.data.question)
      .then((question) => {
        try {
          const difficulty = parseDifficulty(question.difficulty);
          const codeSnippets = parseCodeSnippets(question.codeSnippets);
          questions.push({
            title: question.title.trim(),
            categoryTitle: question.categoryTitle.trim(),
            content: question.content,
            hints: question.hints.map((hint) => hint.trim()),
            topicTags: question.topicTags.map((tag) => ({
              name: tag.name.trim(),
            })),
            difficulty,
            codeSnippets,
            testcase: { inputs: question.sampleTestCase.split("\n") },
          });
        } catch (e) {
          if (e instanceof Error) {
            console.warn(`${e.message}: ${question.title}`);
          } else {
            console.warn(e);
          }
        }
      });
    promises.push(promise);
  }
  await Promise.all(promises);
  return questions;
};
