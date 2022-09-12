import { Divider, Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const PeerPrepPage = () => {
  return (
    <Grid container>
      <Grid item xs={2}>
        <NavigationBar />
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item>
        <div>PeerPrep Page</div>
      </Grid>
    </Grid>
  );
};
