import { SvgIconComponent } from "@mui/icons-material";
import {
  ButtonProps,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

type DrawerButtonProps = ButtonProps & {
  Icon: SvgIconComponent;
  buttonDescription: string;
};

export const DrawerButton = ({
  Icon,
  buttonDescription,
}: DrawerButtonProps) => {
  return (
    <ListItemButton
      sx={{
        display: "grid",
        justifyContent: "center",
        padding: "10px",
      }}
    >
      <ListItemIcon sx={{ justifyContent: "center", color: "white" }}>
        <Icon />
      </ListItemIcon>
      <ListItemText
        sx={{
          margin: "0%",
          "& .MuiTypography-root": {
            fontSize: "14px",
            color: "white",
            textAlign: "center",
          },
        }}
        primary={buttonDescription}
      />
    </ListItemButton>
  );
};
