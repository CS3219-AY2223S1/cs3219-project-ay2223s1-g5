import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Container, Stack, Tab, Typography } from "@mui/material";

import { Center } from "src/components/Center";
import { LoginForm } from "src/components/forms/LoginForm";
import { RequestResetPasswordForm } from "src/components/forms/RequestResetPasswordForm";
import { SignUpForm } from "src/components/forms/SignUpForm";

export const LoginPage = () => {
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

  return formType === "resetpassword" ? (
    <Stack
      spacing={4}
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ px: 3 }}
    >
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
        <RequestResetPasswordForm
          onSubmit={() => setFormType("login")}
          loginRedirect={() => setFormType("login")}
        />
      </Container>
    </Stack>
  ) : (
    <TabContext value={formType}>
      <TabList centered onChange={handleChange}>
        {/* We use 50px to synchronise with the reset password screen. */}
        <Tab
          label="Login"
          value="login"
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textTransform: "none",
            height: "50px",
          }}
        />
        <Tab
          label="Sign Up"
          value="signup"
          sx={{
            fontWeight: "bold",
            fontSize: "1.3rem",
            textTransform: "none",
            height: "50px",
          }}
        />
      </TabList>
      <TabPanel value="login">
        <Container sx={{ width: "80%", px: 0 }}>
          <LoginForm
            onSubmit={() => navigate("/dashboard")}
            resetPasswordRedirect={() => setFormType("resetpassword")}
          />
        </Container>
      </TabPanel>
      <TabPanel value="signup">
        <Container sx={{ width: "80%", px: 0 }}>
          <SignUpForm onSubmit={() => setFormType("login")} />
        </Container>
      </TabPanel>
    </TabContext>
  );
};
