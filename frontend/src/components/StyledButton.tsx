import { LoadingButton, LoadingButtonProps } from "@mui/lab";

type StyledButtonProps = LoadingButtonProps & {
  label: string;
};

export const StyledButton = ({ label, ...rest }: StyledButtonProps) => {
  return (
    <LoadingButton
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
      {...rest}
    >
      {label}
    </LoadingButton>
  );
};
