import { SvgIconComponent } from "@mui/icons-material";
import { Card, Input } from "@mui/material";

interface TextBoxProps {
  Icon: SvgIconComponent;
  label: string;
  type?: string;
}

export const InputWithIcon = ({ Icon, label, type }: TextBoxProps) => {
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
      {type === "password" ? (
        <Input
          sx={{
            marginLeft: "10px",
            width: "100%",
          }}
          disableUnderline={true}
          placeholder={label}
          type="password"
        />
      ) : (
        <Input
          sx={{
            marginLeft: "10px",
            width: "100%",
          }}
          disableUnderline={true}
          placeholder={label}
        />
      )}
    </Card>
  );
};
