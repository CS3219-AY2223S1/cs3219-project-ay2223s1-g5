import { Outlet } from "react-router-dom";
import { Container, Grid, Stack } from "@mui/material";

import LogoImage from "../assets/images/Logo/Logo.png";
import PairProgrammingImage from "../assets/images/PairProgramming/PairProgramming.png";

export const LandingLayout = () => {
  return (
    <Grid container height="100vh">
      <Grid container item xs={7} alignItems="center" bgcolor="primary.500">
        <Container
          component="img"
          src={PairProgrammingImage}
          sx={{ width: "50%" }}
        />
      </Grid>
      <Grid item xs={5}>
        <Stack spacing={4} width="100%" height="100%" justifyContent="center">
          <Container component="img" src={LogoImage} sx={{ width: "35%" }} />
          <Outlet />
        </Stack>
      </Grid>
    </Grid>
  );
};
