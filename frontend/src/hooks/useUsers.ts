import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { CreateUserReq } from "~shared/types/api/user.dto";

export const useCreateUser = () => {
  const createUser = async (input: CreateUserReq) => {
    await ApiService.post<void>(`/users`, input);
  };
  const { isLoading: isCreateUserLoading, mutateAsync: createUserMutation } =
    useMutation(createUser);
  return {
    createUserMutation,
    isCreateUserLoading,
  };
};
