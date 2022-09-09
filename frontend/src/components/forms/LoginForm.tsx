import { Controller, FormProvider, useForm } from "react-hook-form";
import { Lock, MailOutline } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { validate } from "email-validator";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";

export interface LoginFormProps {
  onSubmit: () => void;
  resetPasswordRedirect: () => void;
}

type LoginFormState = {
  email: string;
  password: string;
};

export const LoginForm = (props: LoginFormProps) => {
  const formMethods = useForm<LoginFormState>();

  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: LoginFormState) => {
    // TODO: Link up logic.
    console.log(data);
    props.onSubmit();
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
          <Button
            variant="text"
            onClick={props.resetPasswordRedirect}
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
              },
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Forgot your password?
          </Button>
          <StyledButton
            label="Login"
            type="submit"
            // TODO: Link up loading state
            loading={false}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
