import { Divider, Grid } from "@mui/material";

import { PieChart } from "../components/charts/PieChart";
import { NavigationBar } from "../components/NavigationBar";

export const DashboardPage = () => {
  return (
    <Grid container>
      <Grid item xs={2}>
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
      <Grid item xs={10}>
        <PieChart />
      </Grid>
    </Grid>
  );
};
