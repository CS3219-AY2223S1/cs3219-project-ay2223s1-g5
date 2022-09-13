import { NavLink } from "react-router-dom";
import { Container, List, ListItem } from "@mui/material";

import { NavigationBarRoutes } from "src/routes/nav.routes";

import LogoImage from "../assets/images/Logo/Logo.png";

import { DrawerButton } from "./DrawerButton";

export const NavigationBar = () => {
  return (
    <Container disableGutters sx={{ height: "100vh" }}>
      <Container
        component="img"
        src={LogoImage}
        sx={{ my: "10%", width: "80%" }}
      />
      <List>
        {NavigationBarRoutes.map(({ path, label, Icon }) => (
          <NavLink key={label} to={path} style={{ textDecoration: "none" }}>
            {({ isActive }) => {
              return (
                <ListItem
                  key={label}
                  selected={isActive}
                  disablePadding
                  sx={{
                    "&.Mui-selected": {
                      background: "none",
                      "& .MuiListItemIcon-root": {
                        color: "secondary.main",
                      },
                      "& .MuiTypography-root": {
                        color: "secondary.main",
                      },
                    },
                  }}
                >
                  <DrawerButton Icon={Icon} buttonDescription={label} />
                </ListItem>
              );
            }}
          </NavLink>
        ))}
      </List>
    </Container>
  );
};
