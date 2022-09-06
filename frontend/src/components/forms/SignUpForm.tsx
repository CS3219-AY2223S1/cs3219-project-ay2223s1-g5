import { Controller, FormProvider, useForm } from "react-hook-form";
import { AccountCircle, Lock, MailOutline } from "@mui/icons-material";
import { Alert, Snackbar, Stack } from "@mui/material";
import { passwordStrength } from "check-password-strength";
import { validate } from "email-validator";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useCreateUser } from "src/hooks/useUsers";

export interface SignUpFormProps {
  onSubmit: () => void;
}

type CreateUserFormState = {
  email: string;
  name: string;
  password: string;
  passwordConfirmation: string;
};

export const SignUpForm = (props: SignUpFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { createUserMutation, isCreateUserLoading } = useCreateUser();

  const formMethods = useForm<CreateUserFormState>();

  const { handleSubmit, getValues } = formMethods;

  const onSubmit = handleSubmit(async (data: CreateUserFormState) => {
    try {
      await createUserMutation({
        email: data.email,
        name: data.name,
        password: data.password,
      });
      enqueueSnackbar(
        "Successfully created account! Please check your email.",
        {
          variant: "success",
        },
      );
      props.onSubmit();
    } catch (e: unknown) {
      enqueueSnackbar(e as string, {
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
              validate(value) || "Please enter a valid email",
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
          name="name"
          defaultValue={""}
          rules={{ required: "Name is required." }}
          render={({
            field: { value, onBlur, onChange: formOnChange },
            fieldState: { error },
          }) => (
            <InputWithIcon
              Icon={AccountCircle}
              label="Name"
              autoComplete="name"
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
            label="Sign Up"
            type="submit"
            loading={isCreateUserLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
