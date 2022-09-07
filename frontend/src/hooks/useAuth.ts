import { useMutation } from "react-query";

import { ApiService } from "src/services/ApiService";

import { LoginReq, LoginRes } from "~shared/types/api/auth.dto";

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
