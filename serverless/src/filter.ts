import { ProcessedQuestion, Question } from "./types";
export function filter(questions: ProcessedQuestion[]): ProcessedQuestion[];
export function filter(questions: Question[]): Question[];

export function filter(
  questions: Question[] | ProcessedQuestion[],
): Question[] | ProcessedQuestion[] {
  const return_filter = (question: Question | ProcessedQuestion) => {
    return (
      question.content.search(
        /return[^.]*( |>)any(<\/[a-z]*>)? (of them|order)/i,
      ) === -1
    );
  };

  const find_filter = (question: Question | ProcessedQuestion) => {
    return question.content.search(/find any/i) === -1;
  };

  return questions.filter(return_filter).filter(find_filter);
}
