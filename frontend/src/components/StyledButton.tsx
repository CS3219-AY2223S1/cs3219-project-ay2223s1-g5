import { LoadingButton, LoadingButtonProps } from "@mui/lab";

type StyledButtonProps = LoadingButtonProps & {
  label: string;
};

export const StyledButton = ({ label, sx, ...rest }: StyledButtonProps) => {
  return (
    <LoadingButton
      variant="contained"
      sx={{
        borderRadius: "20px",
        height: "40px",
        fontWeight: "bold",
        textTransform: "none",
        // FIXME: This prop causes a bug in Safari browsers.
        px: 3,
        "&:hover": {
          bgcolor: `${rest?.color || "primary"}.700`,
          boxShadow: "1",
        },
        ...sx,
      }}
      {...rest}
    >
      {label}
    </LoadingButton>
  );
};
