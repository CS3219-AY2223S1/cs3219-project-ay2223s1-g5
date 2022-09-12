import { Divider, Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const DashboardPage = () => {
  return (
    <Grid container>
      <Grid item xs={2}>
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs={10}>
        <div>Dashboard Page</div>
      </Grid>
    </Grid>
  );
};
