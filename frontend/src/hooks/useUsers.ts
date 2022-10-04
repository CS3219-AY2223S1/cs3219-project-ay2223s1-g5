import { useMutation, useQueries, useQuery } from "react-query";

import { ApiResponseError, ApiService } from "src/services/ApiService";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  RequestVerifyEmailReq,
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

export const useGetUsersName = (
  userIds: number[],
): (GetUserNameRes & { userId: number })[] => {
  const getUserName = async (userId: number) => {
    const { data } = await ApiService.get<GetUserNameRes>(`/users/${userId}`);
    return data;
  };
  const results = useQueries(
    userIds.map((userId) => {
      return {
        queryKey: ["USER", userId.toString()],
        queryFn: () =>
          getUserName(userId).then((value) => ({ ...value, userId })),
        onError: (e: ApiResponseError) => {
          // eslint-disable-next-line no-console
          console.log(e.message);
        },
      };
    }),
  );

  // Manual typecast because TS can't detect that filter removes undefined.
  return results
    .filter((result) => !!result.data)
    .map((result) => result.data) as unknown as (GetUserNameRes & {
    userId: number;
  })[];
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

export const useRequestVerificationEmail = () => {
  const requestVerificationEmail = async (input: RequestVerifyEmailReq) => {
    await ApiService.post<void>(`/users/verifications`, input);
  };
  const {
    isLoading: isRequestVerificationEmailLoading,
    mutateAsync: requestVerificationEmailMutation,
  } = useMutation(requestVerificationEmail);
  return {
    isRequestVerificationEmailLoading,
    requestVerificationEmailMutation,
  };
};
