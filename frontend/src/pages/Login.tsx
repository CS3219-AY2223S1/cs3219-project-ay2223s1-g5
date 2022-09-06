import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Container, Grid, Stack, Tab, Typography } from "@mui/material";

import { LoginForm } from "src/components/forms/LoginForm";
import { RequestPasswordResetForm } from "src/components/forms/RequestPasswordResetForm";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";
import { SignUpForm } from "../components/forms/SignUpForm";

export const Login = () => {
  const [formType, setFormType] = useState<
    "login" | "signup" | "resetpassword"
  >("login");

  const navigate = useNavigate();

  const handleChange = (
    _: React.SyntheticEvent | undefined,
    formType: "login" | "signup" | "resetpassword",
  ) => {
    setFormType(formType);
  };

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
          {formType === "resetpassword" ? (
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
                <RequestPasswordResetForm
                  onSubmit={() => setFormType("login")}
                  loginRedirect={() => setFormType("login")}
                />
              </Container>
            </Stack>
          ) : (
            <TabContext value={formType}>
              <TabList centered onChange={handleChange}>
                <Tab
                  label="Login"
                  value="login"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "130%",
                    textTransform: "none",
                  }}
                />
                <Tab
                  label="Sign Up"
                  value="signup"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "130%",
                    textTransform: "none",
                  }}
                />
              </TabList>
              <TabPanel value="login">
                <Container sx={{ width: "80%", paddingX: 0 }}>
                  <LoginForm
                    // TODO: Navigate to dashboard.
                    onSubmit={() => navigate("/dashboard")}
                    resetPasswordRedirect={() => setFormType("resetpassword")}
                  />
                </Container>
              </TabPanel>
              <TabPanel value="signup">
                <Container sx={{ width: "80%", paddingX: 0 }}>
                  <SignUpForm onSubmit={() => setFormType("signup")} />
                </Container>
              </TabPanel>
            </TabContext>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};
