import { Link, useLocation } from "react-router-dom";
import {
  AccountCircleOutlined,
  LaptopOutlined,
  WebOutlined,
} from "@mui/icons-material";
import { Drawer, List, ListItem, Toolbar } from "@mui/material";

import { DrawerButton } from "./DrawerButton";

export const NavigationBar = () => {
  const location = useLocation();
  const pages = ["Account", "Dashboard", "PeerPrep"];
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        minWidth: "100px",
        "& .MuiPaper-root": { backgroundColor: "primary.main" },
      }}
    >
      <Toolbar />
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
    </Drawer>
  );
};
