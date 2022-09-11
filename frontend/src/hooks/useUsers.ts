import { useCallback } from "react";
import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { CreateUserReq, GetUserNameRes } from "~shared/types/api/user.dto";

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

export const useGetUsername = () => {
  const getUsername = useCallback(async (userId: number) => {
    const { data } = await ApiService.get<GetUserNameRes | undefined>(
      `/users/${userId}`,
    );
    return data?.name;
  }, []);

  return { getUsername };
};
