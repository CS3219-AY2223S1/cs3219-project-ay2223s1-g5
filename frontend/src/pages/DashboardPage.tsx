import { Grid, Typography } from "@mui/material";

import { BarChart } from "../components/charts/BarChart";
import { PieChart } from "../components/charts/PieChart";

export const DashboardPage = () => {
  return (
    <Grid container>
      <Grid item xs={4} sx={{ backgroundColor: "grey.100" }}>
        <Grid container direction="row">
          <Grid item xs={0.5} sx={{ backgroundColor: "primary.900" }}></Grid>
          <Grid item xs={11.5}>
            <Typography variant="body1" sx={{ pl: "5%", py: "2%" }}>
              Questions Attempted
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <PieChart />
        </Grid>
      </Grid>

      <Grid item xs={8} sx={{ backgroundColor: "grey.100" }}>
        <Grid container direction="row">
          <Grid item xs={0.5} sx={{ backgroundColor: "primary.500" }}></Grid>
          <Grid item xs={11.5}>
            <Typography variant="body1" sx={{ pl: "5%", py: "2%" }}>
              Question Sources
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <BarChart />
        </Grid>
      </Grid>
    </Grid>
  );
};
