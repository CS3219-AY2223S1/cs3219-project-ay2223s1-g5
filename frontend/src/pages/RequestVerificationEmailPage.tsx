import { useNavigate } from "react-router-dom";
import { Container, Stack, Typography } from "@mui/material";

import { Center } from "src/components/Center";
import { RequestVerificationEmailForm } from "src/components/forms/RequestVerificationEmailForm";

export const RequestVerificationEmailPage = () => {
  const navigate = useNavigate();

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
          Resend Activation Email
        </Typography>
      </Center>
      <Container sx={{ width: "80%", p: 3, alignSelf: "center" }}>
        <RequestVerificationEmailForm
          onSubmit={() => navigate("/")}
          loginRedirect={() => navigate("/")}
        />
      </Container>
    </Stack>
  );
};
