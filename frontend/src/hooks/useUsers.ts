import { useMutation, useQuery } from "react-query";

import { ApiService } from "src/services/ApiService";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  ResetPasswordReq,
} from "~shared/types/api";

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

export const useRequestResetPassword = () => {
  const requestResetPassword = async (input: RequestResetPasswordReq) => {
    await ApiService.post<void>(`/users/reset-password`, input);
  };
  const {
    isLoading: isRequestResetPasswordLoading,
    mutateAsync: requestResetPasswordMutation,
  } = useMutation(requestResetPassword);
  return {
    requestResetPasswordMutation,
    isRequestResetPasswordLoading,
  };
};

export const useResetPassword = () => {
  const requestResetPassword = async (input: ResetPasswordReq) => {
    await ApiService.patch<void>(`/users/reset-password`, input);
  };
  const {
    isLoading: isResetPasswordLoading,
    mutateAsync: resetPasswordMutation,
  } = useMutation(requestResetPassword);
  return {
    resetPasswordMutation,
    isResetPasswordLoading,
  };
};
