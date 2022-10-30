import { Outlet } from "react-router-dom";
import { Divider, Stack } from "@mui/material";

import { NavigationBar } from "src/components/NavigationBar";

export const SidebarLayout = () => {
  return (
    <Stack
      direction="row"
      sx={{ minWidth: 0, width: "100%", maxWidth: "100vw" }}
    >
      <Stack sx={{ minWidth: "200px", bgcolor: "blueGrey.50" }}>
        <NavigationBar />
      </Stack>
      <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
      <Stack
        spacing={2}
        sx={{
          minWidth: 0,
          flex: "1",
          borderTop: "10px solid",
          borderColor: "primary.500",
          justifyContent: "center",
          p: 5,
        }}
      >
        <Outlet />
      </Stack>
    </Stack>
  );
};
