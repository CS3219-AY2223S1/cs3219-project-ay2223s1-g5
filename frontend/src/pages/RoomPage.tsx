import { Avatar, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

import { Editor } from "../components/Editor";
import { Question } from "../components/Question";
import { StyledButton } from "../components/StyledButton";

export const RoomPage = () => {
  return (
    <Grid
      container
      sx={{ borderTop: "10px solid", borderColor: "primary.500" }}
    >
      <Grid item xs={12}>
        <Grid
          container
          item
          xs={12}
          sx={{ py: 2, px: 3, justifyContent: "space-between" }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: "primary.A700",
              }}
            />
            <Avatar
              sx={{
                width: "36px",
                height: "36px",
                bgcolor: "primary.A700",
              }}
            />
          </Stack>
          <StyledButton label={"Leave Room"} sx={{ bgcolor: "red.500" }} />
        </Grid>
        <Divider />
        <Stack direction="row" spacing={2} sx={{ p: 3 }}>
          <Grid item xs={6}>
            <Question />
          </Grid>
          <Grid item xs={6}>
            <Editor />
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
