import { Button, ButtonProps } from "@mui/material";

export const TextButton = ({ variant, sx, children, ...rest }: ButtonProps) => {
  return (
    <Button
      variant="text"
      sx={{
        ml: -1,
        "&:hover": {
          backgroundColor: "transparent",
          color: "primary.700",
        },
        fontWeight: "bold",
        textTransform: "none",
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};
