import Card from "@mui/material/Card";
import Input from "@mui/material/Input";

import LockResetIcon from "@mui/icons-material/LockReset";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FaceIcon from "@mui/icons-material/Face";

interface TextBoxProps {
  label: string;
  icon: string;
}

export const InputWithIcon = ({ label, icon }: TextBoxProps) => {
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
      {icon === "Email" && (
        <MailOutlineIcon
          sx={{
            color: "primary.main",
            alignSelf: "center",
          }}
        />
      )}
      {icon === "Username" && (
        <FaceIcon
          sx={{
            color: "primary.main",
            alignSelf: "center",
          }}
        />
      )}
      {icon === "Password" && (
        <LockResetIcon
          sx={{
            color: "primary.main",
            alignSelf: "center",
          }}
        />
      )}
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
