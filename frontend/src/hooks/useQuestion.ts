import { useQuery } from "react-query";

import { ApiService } from "src/services/ApiService";

import { GetQuestionRes } from "~shared/types/api";

export const useGetQuestion = (questionId?: number) => {
  const getQuestion = async () => {
    const { data } = await ApiService.get<GetQuestionRes | undefined>(
      `/questions/${questionId}`,
    );
    return data;
  };
  const { data: question, isLoading: isGetQuestionLoading } = useQuery(
    ["QUESTION", questionId?.toString() || ""],
    getQuestion,
    { enabled: !!questionId },
  );
  return {
    question,
    isGetQuestionLoading,
  };
};
