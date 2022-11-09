import { Stack, Typography } from "@mui/material";

import { UpdateDisplayNameForm } from "src/components/forms/UpdateDisplayNameForm";
import { PasswordRequirement } from "src/components/PasswordRequirement";
import { useAuth } from "src/contexts/AuthContext";

export const ChangeDisplayName = () => {
  const { user } = useAuth();

  return (
    <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
      <Stack spacing={0.5}>
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          Update Your Display Name
        </Typography>
        <Typography variant="body2">Personalize Your Name</Typography>
        <Typography variant="body2">
          Your display name should contain:
        </Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: "center" }} spacing={3}>
        <PasswordRequirement label="3+" description="Character" />
      </Stack>
      {/* To add ChangeNameForm here */}
      <UpdateDisplayNameForm
        userId={user?.userId || 0}
        name={user?.name || ""}
      />
    </Stack>
  );
};
