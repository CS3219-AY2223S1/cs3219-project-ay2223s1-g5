import { Outlet } from "react-router-dom";
import { Divider, Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const SidebarLayout = () => {
  return (
    <Grid container wrap="nowrap">
      <Grid item sx={{ width: "200px" }}>
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
      <Grid
        item
        sx={{
          backgroundColor: "secondary.light",
          p: "2%",
          flexGrow: "1",
        }}
      >
        <Outlet />
      </Grid>
    </Grid>
  );
};
