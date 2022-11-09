import {
  Box,
  CircularProgress,
  CircularProgressProps,
  Typography,
  TypographyProps,
} from "@mui/material";

import { Center } from "src/components/Center";

type TimerProps = CircularProgressProps & {
  total: number;
  state: number;
  typography?: TypographyProps;
};

export const Timer = ({ state, total, typography, ...rest }: TimerProps) => {
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
        <Typography {...typography}>{state}</Typography>
      </Center>
    </Box>
  );
};
