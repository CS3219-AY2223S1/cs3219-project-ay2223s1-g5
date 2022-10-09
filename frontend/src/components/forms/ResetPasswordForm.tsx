import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Lock } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useResetPassword } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";
import isStrongPassword from "validator/es/lib/isStrongPassword";

export interface ResetPasswordFormProps {
  userId: number;
  code: string;
}

type ResetPasswordFormState = {
  password: string;
  passwordConfirmation: string;
};

export const ResetPasswordForm = (props: ResetPasswordFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { resetPasswordMutation, isResetPasswordLoading } = useResetPassword();
  const navigate = useNavigate();

  const formMethods = useForm<ResetPasswordFormState>();

  const { handleSubmit, getValues } = formMethods;

  const onSubmit = handleSubmit(async (data: ResetPasswordFormState) => {
    try {
      await resetPasswordMutation({
        userId: props.userId,
        code: props.code,
        password: data.password,
      });
      enqueueSnackbar("Successfully reset password! Please login.", {
        variant: "success",
      });
      navigate("/");
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
          name="password"
          defaultValue={""}
          rules={{
            required: "Password is required.",
            // TODO: Abstract this and improve error message.
            validate: (value: string) => {
              return isStrongPassword(value) || "Password is too weak.";
            },
          }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={Lock}
              type="password"
              autoComplete="new-password"
              label="Password"
              value={value ?? ""}
              onBlur={onBlur}
              onChange={formOnChange}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="passwordConfirmation"
          defaultValue={""}
          rules={{
            required: "Password confirmation is required.",
            validate: (value: string) =>
              getValues("password") === value || "Passwords do not match.",
          }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={Lock}
              type="password"
              autoComplete="new-password"
              label="Confirm Password"
              value={value ?? ""}
              onBlur={onBlur}
              onChange={formOnChange}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Stack direction="row" justifyContent="space-around">
          <StyledButton
            label="Reset Password"
            type="submit"
            loading={isResetPasswordLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
