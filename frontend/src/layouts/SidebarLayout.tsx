import { Outlet } from "react-router-dom";
import { Divider, Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const SidebarLayout = () => {
  return (
    <Grid container>
      <Grid item xs={2}>
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item>
        <Outlet />
      </Grid>
    </Grid>
  );
};
