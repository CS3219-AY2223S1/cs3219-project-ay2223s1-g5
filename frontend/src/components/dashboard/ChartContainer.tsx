import { ReactNode } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";

type ChartContainerProps = {
  title: string;
  chart: ReactNode;
  Icon: SvgIconComponent;
};

export const ChartContainer = ({ title, chart, Icon }: ChartContainerProps) => {
  return (
    <Stack
      spacing={2}
      sx={{ minWidth: 0, width: "100%", height: "100%", overflow: "none" }}
    >
      <Typography
        variant="body1"
        sx={{
          bgcolor: "white",
          borderLeft: "15px solid",
          borderColor: "primary.500",
          display: "flex",
          pl: 2,
          py: 1,
        }}
      >
        <Icon sx={{ color: "primary.500", mr: 1 }} />
        {title}
      </Typography>
      {chart}
    </Stack>
  );
};
