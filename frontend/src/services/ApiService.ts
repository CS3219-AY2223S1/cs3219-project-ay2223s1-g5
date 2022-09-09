import axios, { AxiosError, AxiosResponse } from "axios";

const API_BASE_URL = "/api";

const getApiErrorMessage = (error: unknown): string => {
  const defaultErrorMessage = "Something went wrong";

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return defaultErrorMessage;
    }

    const response = error.response as AxiosResponse<
      { message: string } | undefined
    >;

    return (
      response?.data?.message ?? response?.statusText ?? defaultErrorMessage
    );
  }

  if (error instanceof Error) {
    return error.message ?? defaultErrorMessage;
  }

  return defaultErrorMessage;
};

// We use Pascal case here since this acts as a singleton in the application.
export const ApiService = axios.create({
  baseURL: API_BASE_URL,
});

ApiService.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const transformedError = getApiErrorMessage(error);
    throw transformedError;
  },
);
