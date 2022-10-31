import { Controller, FormProvider, useForm } from "react-hook-form";
import { AccountCircle, Lock, MailOutline } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useCreateUser } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";
import isEmail from "validator/es/lib/isEmail";
import isStrongPassword from "validator/es/lib/isStrongPassword";

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
  const { createUser, isCreateUserLoading } = useCreateUser();

  const formMethods = useForm<CreateUserFormState>();

  const { handleSubmit, getValues } = formMethods;

  const onSubmit = handleSubmit(async (data: CreateUserFormState) => {
    try {
      await createUser({
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
          name="name"
          defaultValue={""}
          rules={{
            required: "Name is required.",
            minLength: {
              value: 3,
              message: "Display name must be at least 3 characters.",
            },
          }}
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
            label="Sign Up"
            type="submit"
            loading={isCreateUserLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
