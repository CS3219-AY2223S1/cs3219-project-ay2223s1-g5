import Card from "@mui/material/Card";
import Input from "@mui/material/Input";

import LockResetIcon from "@mui/icons-material/LockReset";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import FaceIcon from "@mui/icons-material/Face";

interface TextBoxProps {
  label: string;
  icon: string;
}

export const TextBox = ({ label, icon }: TextBoxProps) => {
  return (
    <Card
      sx={{
        width: "90%",
        borderRadius: "20px",
        display: "flex",
        boxShadow: "2",
      }}
    >
      {icon === "Email" && (
        <MailOutlineIcon sx={{ color: "primary.main", ml: "4%", mt: "0.6%" }} />
      )}
      {icon === "Username" && (
        <FaceIcon sx={{ color: "primary.main", ml: "4%", mt: "0.6%" }} />
      )}
      {icon === "Password" && (
        <LockResetIcon sx={{ color: "primary.main", ml: "4%", mt: "0.6%" }} />
      )}
      <Input
        sx={{
          ml: "4%",
          "& .MuiInputBase-root": {
            width: "100%",
            height: "100%",
            "& .MuiInputBase-input": {
              ml: "5%",
            },
          },
          width: "100%",
        }}
        disableUnderline={true}
        placeholder={label}
      />
    </Card>
  );
};
