import { Grid, Typography } from "@mui/material";

import { BarChart } from "../components/charts/BarChart";
import { PieChart } from "../components/charts/PieChart";

export const DashboardPage = () => {
  return (
    <Grid container>
      <Grid item xs={4}>
        <Grid container direction="row">
          <Grid item sx={{ bgcolor: "primary.500", width: "16px" }}></Grid>
          <Grid item sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ pl: 2, py: 1 }}>
              Questions Attempted
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <PieChart />
        </Grid>
      </Grid>
      <Grid item xs={8}>
        <Grid container direction="row">
          <Grid item sx={{ bgcolor: "primary.500", width: "16px" }}></Grid>
          <Grid item sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ pl: 2, py: 1 }}>
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
