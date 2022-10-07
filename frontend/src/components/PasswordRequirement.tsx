import { Stack, Typography } from "@mui/material";

type PasswordRequirementProps = {
  label: string;
  description: string;
};

export const PasswordRequirement = ({
  label,
  description,
}: PasswordRequirementProps) => {
  return (
    <Stack direction="column" spacing={0}>
      <Typography sx={{ fontWeight: "bold", alignSelf: "center" }}>
        {label}
      </Typography>
      <Typography variant="caption">{description}</Typography>
    </Stack>
  );
};
