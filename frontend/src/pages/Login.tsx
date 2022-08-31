import React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";

const Login = () => {
  const [value, setValue] = React.useState("login");
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Grid container sx={{ height: "100vh" }}>
      <Grid
        item
        xs={8}
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "primary.main",
        }}
      >
        <Grid xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src={PairProgrammingImage}
            alt=""
            sx={{ height: "50%", width: "50%" }}
          ></Box>
        </Grid>
      </Grid>
      <Grid item xs={4}>
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box
            component="img"
            src={LogoImage}
            alt=""
            sx={{ height: "30%", width: "30%", marginTop: "30%" }}
          ></Box>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: "5%" }}>
          <TabContext value={value}>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <TabList onChange={handleChange}>
                <Tab
                  label="Login"
                  value="login"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "130%",
                    textTransform: "none",
                  }}
                  disableRipple
                />
                <Tab
                  label="Sign Up"
                  value="signup"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "130%",
                    textTransform: "none",
                  }}
                  disableRipple
                />
              </TabList>
            </Box>
            <TabPanel value="login">Login</TabPanel>
            <TabPanel value="signup">Sign Up</TabPanel>
          </TabContext>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Login;
