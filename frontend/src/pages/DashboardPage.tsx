import { Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const DashboardPage = () => {
  return (
    <Grid container sx={{ height: "100vh" }}>
      <NavigationBar />
      <div>Dashboard Page</div>
    </Grid>
  );
};
