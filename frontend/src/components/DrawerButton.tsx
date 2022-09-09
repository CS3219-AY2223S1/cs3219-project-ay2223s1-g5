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
        "&:hover": {
          background: "none",
        },
      }}
    >
      <ListItemIcon
        sx={{
          justifyContent: "center",
          color: "primary.main",
        }}
      >
        <Icon />
      </ListItemIcon>
      <ListItemText
        sx={{
          margin: "0%",
          "& .MuiTypography-root": {
            fontSize: "14px",
            color: "primary.main",
            textAlign: "center",
          },
        }}
        primary={buttonDescription}
      />
    </ListItemButton>
  );
};
