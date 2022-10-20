import { Outlet } from "react-router-dom";
import { Divider, Stack } from "@mui/material";

import { NavigationBar } from "src/components/NavigationBar";

export const SidebarLayout = () => {
  return (
    <Stack direction="row">
      <Stack sx={{ minWidth: "200px", bgcolor: "blueGrey.50" }}>
        <NavigationBar />
      </Stack>
      <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
      <Stack
        spacing={2}
        sx={{
          flexGrow: "1",
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
