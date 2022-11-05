import { Controller, FormProvider, useForm } from "react-hook-form";
import { Lock } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useUpdatePassword } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";
import isStrongPassword from "validator/es/lib/isStrongPassword";

type UpdatePasswordFormState = {
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
};

export const UpdatePasswordForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { updatePassword, isUpdatePasswordLoading } = useUpdatePassword();

  const formMethods = useForm<UpdatePasswordFormState>();

  const { handleSubmit, getValues } = formMethods;

  const onSubmit = handleSubmit(async (data: UpdatePasswordFormState) => {
    try {
      await updatePassword({
        oldPassword: data.oldPassword,
        newPassword: data.password,
      });
      enqueueSnackbar("Successfully updated password!", {
        variant: "success",
      });
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
          name="oldPassword"
          defaultValue={""}
          rules={{
            required: "Current password is required.",
          }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={Lock}
              type="password"
              autoComplete="password"
              label="Current Password"
              value={value ?? ""}
              onBlur={onBlur}
              onChange={formOnChange}
              error={!!error}
              helperText={error?.message}
            />
          )}
        />
        <Controller
          name="password"
          defaultValue={""}
          rules={{
            required: "Password is required.",
            // TODO: Abstract this and improve error message.
            validate: (value: string) => {
              // We should do this at the backend.
              if (getValues("oldPassword") === value) {
                return "New password cannot be the same as existing password.";
              }
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
            label="Update Password"
            type="submit"
            loading={isUpdatePasswordLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
