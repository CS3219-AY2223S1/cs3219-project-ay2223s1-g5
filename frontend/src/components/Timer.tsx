import { Box, CircularProgress, CircularProgressProps } from "@mui/material";

import { Center } from "./Center";

type TimerProps = CircularProgressProps & {
  total: number;
  state: number;
};

export const Timer = ({ state, total, ...rest }: TimerProps) => {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={(state / total) * 100}
        {...rest}
      />
      <Center
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
        }}
      >
        {state}
      </Center>
    </Box>
  );
};
