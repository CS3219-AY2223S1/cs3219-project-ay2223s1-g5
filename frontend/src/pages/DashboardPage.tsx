import { Grid, Typography } from "@mui/material";

import { HorizontalBarChart } from "../components/charts/HorizontalBarChart";
import { PieChart } from "../components/charts/PieChart";
import { ScatterPlot } from "../components/charts/ScatterPlot";
import { VerticalBarChart } from "../components/charts/VerticalBarChart";

export const DashboardPage = () => {
  return (
    <Grid container>
      <Grid item xs={5.75}>
        <Grid container item direction="row">
          <Grid
            item
            sx={{
              backgroundColor: "primary.main",
              height: "40px",
              width: "30px",
            }}
          ></Grid>
          <Grid
            item
            sx={{
              height: "40px",
              display: "flex",
              flexGrow: "1",
              backgroundColor: "primary.light",
            }}
          >
            <Typography
              variant="body1"
              sx={{ alignSelf: "center", ml: "20px" }}
            >
              Questions Attempted
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ height: "20px" }}></Grid>
        <Grid item xs={12} sx={{ backgroundColor: "primary.light" }}>
          <PieChart />
        </Grid>
      </Grid>

      <Grid item xs={0.25}></Grid>

      <Grid item xs={5.75}>
        <Grid container item direction="row">
          <Grid
            item
            sx={{
              backgroundColor: "primary.main",
              height: "40px",
              width: "30px",
            }}
          ></Grid>
          <Grid
            item
            sx={{
              height: "40px",
              display: "flex",
              flexGrow: "1",
              backgroundColor: "primary.light",
            }}
          >
            <Typography
              variant="body1"
              sx={{ alignSelf: "center", ml: "20px" }}
            >
              Question Sources
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ height: "20px" }}></Grid>
        <Grid item xs={12} sx={{ backgroundColor: "primary.light" }}>
          <HorizontalBarChart />
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ height: "20px" }}></Grid>

      {/* Second Stack*/}
      <Grid item xs={5.75}>
        <Grid container item direction="row">
          <Grid
            item
            sx={{
              backgroundColor: "primary.main",
              height: "40px",
              width: "30px",
            }}
          ></Grid>
          <Grid
            item
            sx={{
              height: "40px",
              display: "flex",
              flexGrow: "1",
              backgroundColor: "primary.light",
            }}
          >
            <Typography
              variant="body1"
              sx={{ alignSelf: "center", ml: "20px" }}
            >
              Time Taken
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ height: "20px" }}></Grid>
        <Grid item xs={12} sx={{ backgroundColor: "primary.light" }}>
          <ScatterPlot />
        </Grid>
      </Grid>

      <Grid item xs={0.25}></Grid>

      <Grid item xs={5.75}>
        <Grid container item direction="row">
          <Grid
            item
            sx={{
              backgroundColor: "primary.main",
              height: "40px",
              width: "30px",
            }}
          ></Grid>
          <Grid
            item
            sx={{
              height: "40px",
              display: "flex",
              flexGrow: "1",
              backgroundColor: "primary.light",
            }}
          >
            <Typography
              variant="body1"
              sx={{ alignSelf: "center", ml: "20px" }}
            >
              Average Time Taken
            </Typography>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ height: "20px" }}></Grid>
        <Grid item xs={12} sx={{ backgroundColor: "primary.light" }}>
          <VerticalBarChart />
        </Grid>
      </Grid>
    </Grid>
  );
};
