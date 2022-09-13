import { useMutation, useQuery } from "react-query";

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

export const useGetUserName = (userId?: number) => {
  const getUserName = async () => {
    const { data } = await ApiService.get<GetUserNameRes | undefined>(
      `/users/${userId}`,
    );
    return data;
  };
  const { data: user, isLoading: isGetUserNameLoading } = useQuery(
    ["USER", userId?.toString() || ""],
    getUserName,
    {
      enabled: !!userId,
    },
  );
  return {
    user,
    isGetUserNameLoading,
  };
};
