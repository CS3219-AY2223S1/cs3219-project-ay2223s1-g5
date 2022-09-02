import { Card, Input } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";

interface TextBoxProps {
  Icon: SvgIconComponent;
  label: string;
}

export const InputWithIcon = ({ Icon, label }: TextBoxProps) => {
  return (
    <Card
      sx={{
        width: "70%",
        borderRadius: "20px",
        display: "flex",
        px: "4%",
        height: "40px",
      }}
    >
      <Icon
        sx={{
          color: "primary.main",
          alignSelf: "center",
        }}
      />
      <Input
        sx={{
          marginLeft: "10px",
          width: "100%",
        }}
        disableUnderline={true}
        placeholder={label}
      />
    </Card>
  );
};
