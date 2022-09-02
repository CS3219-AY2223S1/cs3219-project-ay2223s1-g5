import { useState } from "react";

import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { TextBox } from "../components/TextBox";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";

export const Login = () => {
  const [formType, setFormType] = useState<"login" | "signup">("login");
  const handleChange = (event: React.SyntheticEvent, formType: string) => {
    formType === "login" ? setFormType("login") : setFormType("signup");
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
      <Grid item xs={4} display="grid" alignItems="center">
        <Stack spacing={3}>
          <Container component="img" src={LogoImage} sx={{ width: "35%" }} />
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
              <Stack spacing={4} alignItems="center">
                <TextBox label="Email" icon="Email" />
                <TextBox label="Password" icon="Password" />
              </Stack>
            </TabPanel>
            <TabPanel value="signup">
              <Stack spacing={4} alignItems="center">
                <TextBox label="Email" icon="Email" />
                <TextBox label="Username" icon="Username" />
                <TextBox label="Password" icon="Password" />
              </Stack>
            </TabPanel>
          </TabContext>
        </Stack>
      </Grid>
    </Grid>
  );
};
