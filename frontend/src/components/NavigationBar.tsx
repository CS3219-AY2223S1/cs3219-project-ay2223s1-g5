import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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

import {
  DisplayedNavigationBarRoutes,
  HiddenNavigationBarRoutes,
} from "src/routes/nav.routes";

import { DrawerButton } from "./DrawerButton";

export const NavigationBar = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleChange = () => {
    setExpanded(expanded ? false : true);
  };

  return (
    <Container disableGutters sx={{ height: "100vh" }}>
      <Box sx={{ textAlign: "center", mt: "8%" }}>
        <IconButton onClick={handleChange}>
          <Avatar sx={{ width: "50px", height: "50px" }} />
        </IconButton>
        <Accordion expanded={expanded} sx={{ boxShadow: "none" }}>
          <AccordionSummary
            sx={{
              minHeight: "0px",
              "& .MuiAccordionSummary-content": {
                m: 0,
              },
              "&.Mui-expanded": {
                minHeight: "0px",
                "& .MuiAccordionSummary-content": {
                  m: 0,
                },
              },
            }}
          ></AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List sx={{ pb: 0 }}>
              {HiddenNavigationBarRoutes.map(({ path, label, Icon }) => (
                <NavLink
                  key={label}
                  to={path}
                  style={{ textDecoration: "none" }}
                >
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
              <ListItem
                key={"Logout"}
                component={Link}
                to={`/`}
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
                <DrawerButton Icon={Logout} buttonDescription={"Logout"} />
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
