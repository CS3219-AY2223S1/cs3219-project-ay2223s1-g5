import { LoadingButton, LoadingButtonProps } from "@mui/lab";

type StyledButtonProps = LoadingButtonProps & {
  label: string;
};

export const StyledButton = ({ label, ...rest }: StyledButtonProps) => {
  return (
    <LoadingButton
      variant="contained"
      sx={{
        borderRadius: "20px",
        fontWeight: "bold",
        textTransform: "none",
        // FIXME: This prop causes a bug in Safari browsers.
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
