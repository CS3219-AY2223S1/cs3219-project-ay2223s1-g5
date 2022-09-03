import { Button } from "@mui/material";

interface StyledButtonProps {
  label: string;
}

export const StyledButton = ({ label }: StyledButtonProps) => {
  return (
    <Button
      variant="contained"
      disableRipple={true}
      sx={{
        borderRadius: "20px",
        fontWeight: "bold",
        textTransform: "none",
        px: "7%",
        "&:hover": {
          backgroundColor: "primary.main",
          boxShadow: "1",
        },
      }}
    >
      {label}
    </Button>
  );
};
