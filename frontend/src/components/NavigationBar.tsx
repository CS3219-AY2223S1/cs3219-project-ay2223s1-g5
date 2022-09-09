import { Link, useLocation } from "react-router-dom";
import {
  AccountCircleOutlined,
  LaptopOutlined,
  WebOutlined,
} from "@mui/icons-material";
import { Container, Divider, List, ListItem } from "@mui/material";

import LogoImage from "../assets/images/Logo/Logo.png";

import { DrawerButton } from "./DrawerButton";

export const NavigationBar = () => {
  const location = useLocation();
  const pages = ["Account", "Dashboard", "PeerPrep"];
  return (
    <Container
      disableGutters
      sx={{ backgroundColor: "primary.light", height: "100vh" }}
    >
      <Container component="img" src={LogoImage} sx={{ my: "10%" }} />
      <Divider />
      <List>
        {pages.map((page) => (
          <ListItem
            key={page}
            component={Link}
            to={`/${page.toLowerCase()}`}
            selected={`/${page.toLowerCase()}` === location.pathname}
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
            {page === "Account" ? (
              <DrawerButton
                Icon={AccountCircleOutlined}
                buttonDescription={page}
              />
            ) : page === "Dashboard" ? (
              <DrawerButton Icon={WebOutlined} buttonDescription={page} />
            ) : page === "PeerPrep" ? (
              <DrawerButton Icon={LaptopOutlined} buttonDescription={page} />
            ) : null}
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
