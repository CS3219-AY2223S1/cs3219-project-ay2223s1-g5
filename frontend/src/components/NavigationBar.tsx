import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Logout } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  ListItem,
} from "@mui/material";

import { NavigationButton } from "src/components/NavigationButton";
import { useAuth } from "src/contexts/AuthContext";
import {
  DisplayedNavigationBarRoutes,
  HiddenNavigationBarRoutes,
} from "src/routes/nav.routes";
import { nameToInitials } from "src/utils/string";

export const NavigationBar = () => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { user, logout } = useAuth();

  const handleChange = () => {
    setExpanded(!expanded);
  };

  return (
    <Container disableGutters sx={{ height: "100vh" }}>
      <Box sx={{ textAlign: "center", mt: 3 }}>
        <IconButton sx={{ mb: 1, p: "4px" }} onClick={handleChange}>
          <Avatar
            sx={{
              width: "48px",
              height: "48px",
              bgcolor: "primary.A700",
            }}
          >
            {nameToInitials(user?.name)}
          </Avatar>
        </IconButton>
        <Accordion expanded={expanded} sx={{ boxShadow: "none" }}>
          <AccordionSummary
            sx={{
              minHeight: 0,
              maxHeight: 0,
              "&.Mui-expanded": {
                minHeight: 0,
              },
            }}
          ></AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List
              sx={{
                py: 0,
                borderColor: "blueGrey.200",
                borderStyle: "solid",
                borderWidth: "2px",
                borderLeftWidth: 0,
                borderRightWidth: 0,
              }}
            >
              {HiddenNavigationBarRoutes.map(({ path, label, Icon }) => (
                <NavLink
                  key={label}
                  to={path}
                  style={{ textDecoration: "none" }}
                >
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
              <ListItem key={"Logout"} disablePadding>
                <NavigationButton
                  Icon={Logout}
                  buttonDescription={"Logout"}
                  onClick={logout}
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
      <List sx={{ pt: 0 }}>
        {DisplayedNavigationBarRoutes.map(({ path, label, Icon }) => (
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
