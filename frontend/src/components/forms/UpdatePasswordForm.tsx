import { Controller, FormProvider, useForm } from "react-hook-form";
import { Lock } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { passwordStrength } from "check-password-strength";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useUpdatePassword } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";

export interface UpdatePasswordFormProps {
  userId: number;
}

type UpdatePasswordFormState = {
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
};

export const UpdatePasswordForm = (props: UpdatePasswordFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { updatePasswordMutation, isUpdatePasswordLoading } = useUpdatePassword(
    props.userId,
  );

  const formMethods = useForm<UpdatePasswordFormState>();

  const { handleSubmit, getValues } = formMethods;

  const onSubmit = handleSubmit(async (data: UpdatePasswordFormState) => {
    try {
      await updatePasswordMutation({
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
              if (getValues("oldPassword") === value) {
                return "New password cannot be the same as existing password.";
              }
              const results = passwordStrength(value);
              return (
                results.value === "Strong" ||
                results.value === "Medium" ||
                "Password is too weak."
              );
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
