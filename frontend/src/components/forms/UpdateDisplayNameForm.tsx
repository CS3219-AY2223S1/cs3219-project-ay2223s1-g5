import { Controller, FormProvider, useForm } from "react-hook-form";
import { AccountCircle } from "@mui/icons-material";
import { Stack } from "@mui/material";
import { useSnackbar } from "notistack";

import { InputWithIcon } from "src/components/InputWithIcon";
import { StyledButton } from "src/components/StyledButton";
import { useAuth } from "src/contexts/AuthContext";
import { useUpdateDisplayName } from "src/hooks/useUsers";
import { ApiResponseError } from "src/services/ApiService";

export interface UpdateDisplayNameFormProps {
  userId: number;
  name: string;
}

type UpdateDisplayNameFormState = {
  name: string;
};

export const UpdateDisplayNameForm = (props: UpdateDisplayNameFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { getUser } = useAuth();
  const { updateDisplayNameMutation, isUpdateDisplayNameLoading } =
    useUpdateDisplayName(props.userId);

  const formMethods = useForm<UpdateDisplayNameFormState>();

  const { handleSubmit } = formMethods;

  const onSubmit = handleSubmit(async (data: UpdateDisplayNameFormState) => {
    try {
      await updateDisplayNameMutation(data);
      enqueueSnackbar("Successfully updated display name!", {
        variant: "success",
      });
      getUser();
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
          name="name"
          defaultValue={props.name}
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
              type="text"
              autoComplete="name"
              label="Display Name"
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
            label="Update Display Name"
            type="submit"
            loading={isUpdateDisplayNameLoading}
          />
        </Stack>
      </Stack>
    </FormProvider>
  );
};
