import { Grid } from "@mui/material";

import { NavigationBar } from "../components/NavigationBar";

export const AccountSettingPage = () => {
  return (
    <Grid container sx={{ height: "100vh" }}>
      <NavigationBar />
      <div>Settings Page</div>
    </Grid>
  );
};
