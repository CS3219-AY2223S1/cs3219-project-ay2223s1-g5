import { Controller, FormProvider, useForm } from "react-hook-form";
import { MailOutline } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import { validate } from "email-validator";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";

export interface RequestPasswordResetForm {
  onSubmit: () => void;
  loginRedirect: () => void;
}

type RequestPasswordResetFormState = {
  email: string;
};

export const RequestPasswordResetForm = (props: RequestPasswordResetForm) => {
  const formMethods = useForm<RequestPasswordResetFormState>();

  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: RequestPasswordResetFormState) => {
    // TODO: Link up logic.
    // eslint-disable-next-line no-console
    console.log(data);
    props.onSubmit();
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
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="text"
            onClick={props.loginRedirect}
            sx={{
              "&:hover": {
                backgroundColor: "transparent",
              },
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            Back to login
          </Button>
          <StyledButton
            label="Reset Password"
            type="submit"
            // TODO: Link up loading state
            loading={false}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
