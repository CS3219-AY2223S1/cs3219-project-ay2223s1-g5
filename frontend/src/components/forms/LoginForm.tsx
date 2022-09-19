import { Controller, FormProvider, useForm } from "react-hook-form";
import { Lock, MailOutline } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { validate } from "email-validator";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useAuth } from "src/contexts/AuthContext";
import { useLogin } from "src/hooks/useAuth";
import { ApiResponseError } from "src/services/ApiService";

import { TextButton } from "../TextButton";

export interface LoginFormProps {
  onSubmit: () => void;
  resetPasswordRedirect: () => void;
}

type LoginFormState = {
  email: string;
  password: string;
};

export const LoginForm = (props: LoginFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { loginMutation, isLoginLoading } = useLogin();
  const { getUser } = useAuth();

  const formMethods = useForm<LoginFormState>();
  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: LoginFormState) => {
    try {
      await loginMutation(data);
      await getUser();
      props.onSubmit();
    } catch (e: unknown) {
      enqueueSnackbar((e as ApiResponseError).message, {
        variant: "error",
      });
    }
  });

  return (
    <FormProvider {...formMethods}>
      <Stack spacing={4} component="form" onSubmit={onSubmit} width="100%">
        <Controller
          name="email"
          defaultValue={""}
          rules={{
            required: "Email is required.",
            validate: {
              isValidEmail: (email: string) =>
                validate(email) || "Please enter a valid email",
              isLowerCase: (email: string) =>
                email.toLowerCase() === email ||
                "Please enter email in lowercase characters",
            },
          }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={MailOutline}
              label="Email"
              autoComplete="email"
              value={value ?? ""}
              onBlur={onBlur}
              onChange={formOnChange}
              error={!!error}
              helperText={error?.message}
              type="email"
            />
          )}
        />
        <Controller
          name="password"
          defaultValue={""}
          rules={{ required: "Password is required." }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={Lock}
              type="password"
              autoComplete="password"
              label="Password"
              value={value ?? ""}
              onBlur={onBlur}
              onChange={formOnChange}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Stack direction="row" justifyContent="space-between">
          <TextButton onClick={props.resetPasswordRedirect}>
            Forgot your password?
          </TextButton>
          <StyledButton label="Login" type="submit" loading={isLoginLoading} />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
