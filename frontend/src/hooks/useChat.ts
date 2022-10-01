import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { CreateTokenRes } from "~shared/types/api";

export const useCreateChatToken = () => {
  const createToken = async () => {
    const { data } = await ApiService.post<CreateTokenRes>(`/chat/token`);
    return data;
  };
  const {
    isLoading: isCreateChatTokenLoading,
    mutateAsync: createChatTokenMutation,
  } = useMutation(createToken);
  return {
    createChatTokenMutation,
    isCreateChatTokenLoading,
  };
};
