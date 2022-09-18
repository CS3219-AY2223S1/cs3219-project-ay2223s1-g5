import { Paper, Typography } from "@mui/material";

export const Editor = () => {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Editor
      </Typography>
    </Paper>
  );
};
