import { Controller, FormProvider, useForm } from "react-hook-form";
import { CloseOutlined, Lock, MailOutline } from "@mui/icons-material";
import { IconButton, Link, Stack } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { TextButton } from "src/components/TextButton";
import { useAuth } from "src/contexts/AuthContext";
import { useLogin } from "src/hooks/useAuth";
import { useRequestVerificationEmail } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";
import isEmail from "validator/es/lib/isEmail";

export interface LoginFormProps {
  onSubmit: () => void;
  resetPasswordRedirect: () => void;
}

type LoginFormState = {
  email: string;
  password: string;
};

export const LoginForm = (props: LoginFormProps) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { loginMutation, isLoginLoading } = useLogin();
  const { requestVerificationEmailMutation } = useRequestVerificationEmail();
  const { getUser } = useAuth();

  const formMethods = useForm<LoginFormState>();
  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: LoginFormState) => {
    try {
      await loginMutation(data);
      await getUser();
      props.onSubmit();
    } catch (e: unknown) {
      const error = e as ApiResponseError;
      if (error.status === 403) {
        enqueueSnackbar(
          <span>
            Account not activated.{" "}
            <Link
              component="button"
              variant="body2"
              sx={{
                color: "blueGrey.900",
                textDecorationColor: blueGrey[900],
              }}
              onClick={async () => {
                try {
                  await requestVerificationEmailMutation({ email: data.email });
                  // We don't need to close the snackbar since we have a limit of one snackbar.
                  enqueueSnackbar("Verification email sent!", {
                    variant: "success",
                  });
                } catch (e: unknown) {
                  enqueueSnackbar((e as ApiResponseError).message, {
                    variant: "error",
                  });
                }
              }}
            >
              Click here to resend email.
            </Link>
          </span>,
          {
            action: (id) => (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton sx={{ p: "4px" }} onClick={() => closeSnackbar(id)}>
                  <CloseOutlined fontSize="small" />
                </IconButton>
              </Box>
            ),
            variant: "warning",
            persist: true,
          },
        );
        return;
      }
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
