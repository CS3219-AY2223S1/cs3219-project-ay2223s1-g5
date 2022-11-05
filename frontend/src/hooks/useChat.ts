import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { CreateTokenRes } from "~shared/types/api";

export const useCreateChatToken = () => {
  const createChatToken = async () => {
    const { data } = await ApiService.post<CreateTokenRes>(`/chat/token`);
    return data;
  };
  const {
    isLoading: isCreateChatTokenLoading,
    mutateAsync: createChatTokenMutation,
  } = useMutation(createChatToken);
  return {
    createChatToken: createChatTokenMutation,
    isCreateChatTokenLoading,
  };
};
