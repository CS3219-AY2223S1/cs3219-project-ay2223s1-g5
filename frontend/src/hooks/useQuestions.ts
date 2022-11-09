import { useQuery } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiService } from "src/services/ApiService";

import { GetQuestionRes } from "~shared/types/api";

export const useQuestion = (questionId?: number) => {
  const getQuestion = async () => {
    const { data } = await ApiService.get<GetQuestionRes | undefined>(
      `/questions/${questionId}`,
    );
    return data;
  };
  const { data: question, isLoading: isQuestionLoading } = useQuery(
    [QUERY_KEYS.QUESTIONS, questionId?.toString() || ""],
    getQuestion,
    { enabled: !!questionId },
  );
  return {
    question,
    isQuestionLoading,
  };
};
