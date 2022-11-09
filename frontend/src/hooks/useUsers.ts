import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiResponseError, ApiService } from "src/services/ApiService";

import {
  CreateUserReq,
  GetUserNameRes,
  RequestResetPasswordReq,
  RequestVerifyEmailReq,
  ResetPasswordReq,
  UpdatePasswordReq,
  UpdateUserReq,
  VerifyEmailReq,
} from "~shared/types/api";

export const useCreateUser = () => {
  const createUser = async (input: CreateUserReq) => {
    await ApiService.post<void>(`/users`, input);
  };
  const { isLoading: isCreateUserLoading, mutateAsync: createUserMutation } =
    useMutation(createUser);
  return {
    createUser: createUserMutation,
    isCreateUserLoading,
  };
};

export const useUserName = (userId?: number) => {
  const getUserName = async () => {
    const { data } = await ApiService.get<GetUserNameRes | undefined>(
      `/users/${userId}`,
    );
    return data;
  };
  const { data: userName, isLoading: isUserNameLoading } = useQuery(
    [QUERY_KEYS.USERS, userId?.toString() || ""],
    getUserName,
    { enabled: !!userId },
  );
  return {
    userName,
    isUserNameLoading,
  };
};

export const useUsersNames = (
  userIds: number[],
): {
  usersNames: (GetUserNameRes & { userId: number })[];
  isUsersNamesLoading: boolean;
} => {
  const getUserName = async (userId: number) => {
    const { data } = await ApiService.get<GetUserNameRes | undefined>(
      `/users/${userId}`,
    );
    return data;
  };
  const results = useQueries(
    userIds.map((userId) => {
      return {
        queryKey: [QUERY_KEYS.USERS, userId.toString()],
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
  let isUsersNamesLoading = false;
  const usersNames: (GetUserNameRes & { userId: number })[] = [];
  for (const result of results) {
    isUsersNamesLoading = isUsersNamesLoading && result.isLoading;
    if (!result.data?.name) {
      continue;
    }
    usersNames.push({ name: result.data.name, userId: result.data.userId });
  }
  return { usersNames, isUsersNamesLoading };
};

export const useUpdateDisplayName = (userId: number) => {
  const queryClient = useQueryClient();
  const updateDisplayName = async (input: UpdateUserReq) => {
    await ApiService.patch<void>(`/users`, input);
    queryClient.invalidateQueries([QUERY_KEYS.USERS, userId.toString()]);
  };
  const {
    isLoading: isUpdateDisplayNameLoading,
    mutateAsync: updateDisplayNameMutation,
  } = useMutation(updateDisplayName);
  return {
    updateDisplayName: updateDisplayNameMutation,
    isUpdateDisplayNameLoading,
  };
};

export const useUpdatePassword = () => {
  const updatePassword = async (input: UpdatePasswordReq) => {
    await ApiService.post<void>(`/users/password`, input);
  };
  const {
    isLoading: isUpdatePasswordLoading,
    mutateAsync: updatePasswordMutation,
  } = useMutation(updatePassword);
  return {
    updatePassword: updatePasswordMutation,
    isUpdatePasswordLoading,
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
    requestResetPassword: requestResetPasswordMutation,
    isRequestResetPasswordLoading,
  };
};

export const useResetPassword = () => {
  const resetPassword = async (input: ResetPasswordReq) => {
    await ApiService.patch<void>(`/users/reset-password`, input);
  };
  const {
    isLoading: isResetPasswordLoading,
    mutateAsync: resetPasswordMutation,
  } = useMutation(resetPassword);
  return {
    resetPassword: resetPasswordMutation,
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
    requestVerificationEmail: requestVerificationEmailMutation,
  };
};

export const useVerifyEmail = () => {
  const verifyEmail = async (input: VerifyEmailReq) => {
    await ApiService.patch<void>(`/users/verifications`, input);
  };
  const { isLoading: isVerifyEmailLoading, mutateAsync: verifyEmailMutation } =
    useMutation(verifyEmail);
  return {
    isVerifyEmailLoading,
    verifyEmail: verifyEmailMutation,
  };
};
