import { SvgIconComponent } from "@mui/icons-material";
import { Stack, TextField, TextFieldProps } from "@mui/material";

type TextBoxProps = TextFieldProps & {
  Icon: SvgIconComponent;
  label: string;
  helperText?: string;
};

export const InputWithIcon = ({ Icon, ...rest }: TextBoxProps) => {
  return (
    <Stack direction="row" width="100%" spacing={2} alignContent="flex-start">
      <Icon
        sx={{
          paddingTop: "8px", // To align with the input when help text is shown.
          color: "primary.main",
        }}
      />
      <TextField
        size="small"
        sx={{
          flexGrow: 1,
          px: "0",
        }}
        {...rest}
      />
    </Stack>
  );
};
