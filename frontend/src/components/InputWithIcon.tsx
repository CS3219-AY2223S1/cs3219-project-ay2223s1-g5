import { SvgIconComponent } from "@mui/icons-material";
import { Stack, TextField, TextFieldProps } from "@mui/material";

import { Center } from "src/components/Center";

type TextBoxProps = TextFieldProps & {
  Icon: SvgIconComponent;
};

export const InputWithIcon = ({ Icon, size, ...rest }: TextBoxProps) => {
  return (
    <Stack direction="row" width="100%" spacing={2} alignContent="flex-start">
      <Center
        // Weird height value to synchorize with text field when helper text is shown.
        sx={{ height: "43.27px", width: "fit-content", "&&": { px: 0 } }}
        id="xxx"
      >
        <Icon
          sx={{
            color: "primary.500",
          }}
        />
      </Center>
      <TextField
        size="small"
        sx={{
          flexGrow: 1,
          px: 0,
        }}
        {...rest}
      />
    </Stack>
  );
};
