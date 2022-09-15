import { NavLink } from "react-router-dom";
import { Container, List, ListItem } from "@mui/material";

import { NavigationBarRoutes } from "src/routes/nav.routes";

import LogoImage from "../assets/images/Logo/Logo.png";

import { NavigationButton } from "./NavigationButton";

export const NavigationBar = () => {
  return (
    <Container disableGutters sx={{ height: "100vh" }}>
      <Container component="img" src={LogoImage} sx={{ my: 4, width: "80%" }} />
      <List>
        {NavigationBarRoutes.map(({ path, label, Icon }) => (
          <NavLink key={label} to={path} style={{ textDecoration: "none" }}>
            {({ isActive }) => {
              return (
                <ListItem key={label} disablePadding>
                  <NavigationButton
                    Icon={Icon}
                    selected={isActive}
                    buttonDescription={label}
                  />
                </ListItem>
              );
            }}
          </NavLink>
        ))}
      </List>
    </Container>
  );
};
