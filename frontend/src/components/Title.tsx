import { Paper, Typography } from "@mui/material";

type TitleProps = {
  title: string;
};

export const Title = ({ title }: TitleProps) => {
  return (
    <Paper elevation={0}>
      <Typography
        variant="h5"
        sx={{
          pl: 1.5,
          py: 1.5,
          fontWeight: "bold",
          borderLeft: "15px solid",
          borderColor: "primary.500",
        }}
      >
        {title}
      </Typography>
    </Paper>
  );
};
