import { Outlet } from "react-router-dom";
import { Divider, Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const SidebarLayout = () => {
  return (
    <Grid container wrap="nowrap">
      <Grid
        item
        sx={{
          minWidth: "200px",
          width: "200px",
          backgroundColor: "blueGrey.50",
        }}
      >
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
      <Grid
        item
        sx={{
          p: 3,
          flexGrow: "1",
        }}
      >
        <Outlet />
      </Grid>
    </Grid>
  );
};
