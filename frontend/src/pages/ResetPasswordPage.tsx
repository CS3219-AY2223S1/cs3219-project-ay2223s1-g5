import { useLocation } from "react-router-dom";
import { Container, Stack, Typography } from "@mui/material";

import { Center } from "src/components/Center";
import { ResetPasswordForm } from "src/components/forms/ResetPasswordForm";

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const code = params.get("code");

  return (
    <Stack
      spacing={4}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ px: 3 }}
    >
      {/* We use 50px to synchronise with the login screen. */}
      <Center sx={{ height: "50px" }}>
        <Typography
          sx={{
            color: "primary.500",
            fontWeight: "bold",
            fontSize: "1.3rem",
            textTransform: "none",
          }}
        >
          Reset Password
        </Typography>
      </Center>
      <Container sx={{ width: "80%", p: 3, alignSelf: "center" }}>
        <ResetPasswordForm code={code ?? ""} userId={Number(userId)} />
      </Container>
    </Stack>
  );
};
