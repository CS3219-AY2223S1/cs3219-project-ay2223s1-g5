import { Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const PeerPrepPage = () => {
  return (
    <Grid container sx={{ height: "100vh" }}>
      <NavigationBar />
      <div>PeerPrep Page</div>
    </Grid>
  );
};
