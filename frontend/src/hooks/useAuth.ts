import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { LoginReq, LoginRes } from "~shared/types/api";

export const useLogin = () => {
  const login = async (input: LoginReq) => {
    const result = await ApiService.post<LoginRes>(`/sessions`, input);
    return result;
  };
  const {
    isSuccess: isLoginSuccess,
    isLoading: isLoginLoading,
    mutateAsync: loginMutation,
  } = useMutation(login);
  return {
    loginMutation,
    isLoginSuccess,
    isLoginLoading,
  };
};

export const useLogout = () => {
  const logout = async () => {
    const result = await ApiService.delete<LoginRes>(`/sessions`);
    return result;
  };
  const { isLoading: isLogoutLoading, mutateAsync: logoutMutation } =
    useMutation(logout);
  return {
    logoutMutation,
    isLogoutLoading,
  };
};

// This hook does not use React Query since we do not want to cache the result.
export const useWhoAmI = () => {
  const whoAmI = async () => {
    const { data } = await ApiService.get<LoginRes | undefined>(`/sessions`);
    return data;
  };
  return { whoAmI };
};
