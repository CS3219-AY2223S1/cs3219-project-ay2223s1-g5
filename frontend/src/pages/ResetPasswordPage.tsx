import { useLocation } from "react-router-dom";
import { Container, Grid, Stack, Typography } from "@mui/material";

import { ResetPasswordForm } from "src/components/forms/ResetPasswordForm";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";

export const ResetPasswordPage = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const userId = params.get("userId");
  const code = params.get("code");

  return (
    <Grid container height="100vh">
      <Grid container item xs={7} alignItems="center" bgcolor="primary.main">
        <Container
          component="img"
          src={PairProgrammingImage}
          sx={{ width: "50%" }}
        />
      </Grid>
      <Grid item xs={5}>
        <Stack spacing={4} width="100%" height="100%" justifyContent="center">
          <Container component="img" src={LogoImage} sx={{ width: "35%" }} />
          <Stack
            spacing={2}
            display="flex"
            justifyContent="center"
            sx={{ px: "24px" }}
          >
            <Container sx={{ display: "flex", justifyContent: "center" }}>
              <Typography
                sx={{
                  color: "primary.main",
                  fontWeight: "bold",
                  fontSize: "130%",
                  textTransform: "none",
                  py: "12px",
                }}
              >
                Reset Password
              </Typography>
            </Container>
            <Container sx={{ width: "80%", px: "24px", alignSelf: "center" }}>
              <ResetPasswordForm code={code ?? ""} userId={Number(userId)} />
            </Container>
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};
