import { Stack, Typography } from "@mui/material";

import { UpdatePasswordForm } from "src/components/forms/UpdatePasswordForm";
import { PasswordRequirement } from "src/components/PasswordRequirement";
import { useAuth } from "src/contexts/AuthContext";

export const ChangePassword = () => {
  const { user } = useAuth();

  return (
    <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
      <Stack spacing={0.5}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Update Your Password
        </Typography>
        <Typography variant="body2">
          Just type it twice and try not to forget it.
        </Typography>
        <Typography variant="body2">Your password should contain:</Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: "center" }} spacing={3}>
        <PasswordRequirement label="8+" description="Character" />
        <PasswordRequirement label="AA" description="Uppercase" />
        <PasswordRequirement label="aa" description="Lowercase" />
        <PasswordRequirement label="@$#" description="Symbol" />
      </Stack>
      <UpdatePasswordForm />
    </Stack>
  );
};
