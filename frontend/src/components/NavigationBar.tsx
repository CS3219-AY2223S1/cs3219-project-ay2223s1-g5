import { NavLink, useLocation } from "react-router-dom";
import {
  AccountCircleOutlined,
  LaptopOutlined,
  WebOutlined,
} from "@mui/icons-material";
import { Container, List, ListItem } from "@mui/material";

import LogoImage from "../assets/images/Logo/Logo.png";

import { DrawerButton } from "./DrawerButton";

export const NavigationBar = () => {
  const location = useLocation();
  const pages = [
    { name: "Account", icon: AccountCircleOutlined },
    { name: "Dashboard", icon: WebOutlined },
    { name: "PeerPrep", icon: LaptopOutlined },
  ];
  return (
    <Container
      disableGutters
      sx={{ backgroundColor: "primary.light", height: "100vh" }}
    >
      <Container component="img" src={LogoImage} sx={{ my: "10%" }} />
      <List>
        {pages.map((page) => (
          <NavLink
            key={page.name}
            to={`/${page.name.toLowerCase()}`}
            style={{ textDecoration: "none" }}
          >
            <ListItem
              key={page.name}
              selected={`/${page.name.toLowerCase()}` === location.pathname}
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
              <DrawerButton Icon={page.icon} buttonDescription={page.name} />
            </ListItem>
          </NavLink>
        ))}
      </List>
    </Container>
  );
};
