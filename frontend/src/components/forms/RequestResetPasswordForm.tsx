import { Controller, FormProvider, useForm } from "react-hook-form";
import { MailOutline } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useRequestResetPassword } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";
import isEmail from "validator/es/lib/isEmail";

import { TextButton } from "../TextButton";

export interface RequestResetPasswordForm {
  onSubmit: () => void;
  loginRedirect: () => void;
}

type RequestResetPasswordFormState = {
  email: string;
};

export const RequestResetPasswordForm = (props: RequestResetPasswordForm) => {
  const { enqueueSnackbar } = useSnackbar();
  const { requestResetPasswordMutation, isRequestResetPasswordLoading } =
    useRequestResetPassword();

  const formMethods = useForm<RequestResetPasswordFormState>();
  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: RequestResetPasswordFormState) => {
    try {
      await requestResetPasswordMutation(data);
      enqueueSnackbar(
        "An email with password reset instructions will be sent if there is an account associated with this email.",
        {
          variant: "success",
        },
      );
      props.onSubmit();
    } catch (e: unknown) {
      enqueueSnackbar((e as ApiResponseError).message, {
        variant: "error",
      });
    }
  });

  return (
    <FormProvider {...formMethods}>
      <Stack spacing={6} component="form" onSubmit={onSubmit} width="100%">
        <Controller
          name="email"
          defaultValue={""}
          rules={{
            required: "Email is required.",
            validate: (value: string) =>
              isEmail(value) || "Please enter a valid email",
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
        <Stack direction="row" justifyContent="space-between">
          <TextButton onClick={props.loginRedirect}>Back to login</TextButton>
          <StyledButton
            label="Reset Password"
            type="submit"
            loading={isRequestResetPasswordLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
