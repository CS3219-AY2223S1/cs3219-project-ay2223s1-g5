import { useState } from "react";

import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Button, Container, Grid, Stack, Tab } from "@mui/material";
import {
  AccountCircle,
  Lock,
  LockReset,
  MailOutline,
} from "@mui/icons-material";

import { InputWithIcon } from "../components/InputWithIcon";
import { StyledButton } from "../components/StyledButton";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";

export const Login = () => {
  const [formType, setFormType] = useState<
    "login" | "signup" | "resetpassword"
  >("login");

  const handleChange = (
    _: React.SyntheticEvent,
    formType: "login" | "signup" | "resetpassword",
  ) => {
    setFormType(formType);
  };

  return (
    <Grid container height="100vh">
      <Grid container item xs={8} alignItems="center" bgcolor="primary.main">
        <Container
          component="img"
          src={PairProgrammingImage}
          sx={{ width: "50%" }}
        />
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={4} width="100%" height="100%" justifyContent="center">
          <Container component="img" src={LogoImage} sx={{ width: "35%" }} />
          {formType === "resetpassword" ? (
            <Stack spacing={4}>
              <Stack spacing={4} alignItems="center">
                <InputWithIcon label="Email" Icon={MailOutline} />
                <InputWithIcon label="New Password" Icon={LockReset} />
                <InputWithIcon label="Confirm New Password" Icon={LockReset} />
              </Stack>
              <Stack direction="row" justifyContent="space-around">
                <StyledButton label="Continue" />
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={4}>
              <TabContext value={formType}>
                <TabList centered onChange={handleChange}>
                  <Tab
                    label="Login"
                    value="login"
                    disableRipple={true}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "130%",
                      textTransform: "none",
                    }}
                  />
                  <Tab
                    label="Sign Up"
                    value="signup"
                    disableRipple={true}
                    sx={{
                      fontWeight: "bold",
                      fontSize: "130%",
                      textTransform: "none",
                    }}
                  />
                </TabList>
                <TabPanel value="login">
                  <Stack spacing={4} alignItems="center">
                    <InputWithIcon label="Email" Icon={MailOutline} />
                    <InputWithIcon label="Password" Icon={Lock} />
                  </Stack>
                </TabPanel>
                <TabPanel value="signup">
                  <Stack spacing={4} alignItems="center">
                    <InputWithIcon label="Email" Icon={MailOutline} />
                    <InputWithIcon label="Username" Icon={AccountCircle} />
                    <InputWithIcon label="Password" Icon={Lock} />
                  </Stack>
                </TabPanel>
              </TabContext>
              {formType === "signup" ? (
                <Stack direction="row" justifyContent="space-around">
                  <StyledButton label="Continue" />
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="space-around">
                  <Button
                    variant="text"
                    disableRipple={true}
                    onClick={(e) => handleChange(e, "resetpassword")}
                    sx={{
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                      fontWeight: "bold",
                      textTransform: "none",
                    }}
                  >
                    Forgot your password?
                  </Button>
                  <StyledButton label="Login" />
                </Stack>
              )}
            </Stack>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};
