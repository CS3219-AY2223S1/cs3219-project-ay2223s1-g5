import { useMemo } from "react";
import { SvgIconComponent } from "@mui/icons-material";
import {
  ListItemButton,
  ListItemButtonProps,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

type NavigationButtonProps = ListItemButtonProps & {
  Icon: SvgIconComponent;
  buttonDescription: string;
};

export const NavigationButton = ({
  Icon,
  buttonDescription,
  selected,
  ...rest
}: NavigationButtonProps) => {
  const color = useMemo(
    () => (selected ? "primary.500" : "blueGrey.500"),
    [selected],
  );

  return (
    <ListItemButton {...rest}>
      <ListItemIcon
        sx={{
          justifyContent: "center",
          color,
        }}
      >
        <Icon />
      </ListItemIcon>
      <ListItemText
        sx={{
          color,
        }}
        primary={buttonDescription}
      />
    </ListItemButton>
  );
};
