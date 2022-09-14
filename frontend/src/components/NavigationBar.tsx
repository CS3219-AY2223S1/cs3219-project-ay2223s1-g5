import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Container,
  IconButton,
  List,
  ListItem,
  Popover,
  Stack,
  Typography,
} from "@mui/material";

import { NavigationBarRoutes } from "src/routes/nav.routes";

import { DrawerButton } from "./DrawerButton";
import { StyledButton } from "./StyledButton";

export const NavigationBar = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Container disableGutters sx={{ height: "100vh" }}>
      <Box sx={{ textAlign: "center", my: "8%" }}>
        <IconButton onClick={handleClick}>
          <Avatar sx={{ width: "50px", height: "50px" }} />
        </IconButton>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "15px",
              minWidth: "250px",
              px: 3,
              pb: 3,
            },
          }}
        >
          <Typography
            variant="body1"
            sx={{ pt: 3, pb: 4, pl: 1, fontWeight: "bold" }}
          >
            Username
          </Typography>
          <Stack spacing={2}>
            <StyledButton label="Account Settings" type="submit" />
            <StyledButton label="Log Out" type="submit" />
          </Stack>
        </Popover>
      </Box>
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
