import { useState } from "react";
import { AccountCircle, Lock } from "@mui/icons-material";
import {
  Avatar,
  Divider,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { NavigationButton } from "src/components/NavigationButton";
import { ChangeDisplayName } from "src/components/settings/ChangeDisplayName";
import { ChangePassword } from "src/components/settings/ChangePassword";
import { Title } from "src/components/Title";
import { useAuth } from "src/contexts/AuthContext";
import { nameToInitials } from "src/utils/string";

export const AccountSettingPage = () => {
  const { user } = useAuth();
  const [formType, setFormType] = useState<"changename" | "changepassword">(
    "changename",
  );

  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    formType: "changename" | "changepassword",
  ) => {
    setFormType(formType);
  };

  return (
    <Stack spacing={2} sx={{ height: "100%" }}>
      <Title title="Settings" />
      <Paper elevation={0}>
        <Stack direction="row" spacing={2} sx={{ ml: 2, py: 3 }}>
          <Avatar
            sx={{
              width: "60px",
              height: "60px",
              bgcolor: "primary.A700",
            }}
          >
            {nameToInitials(user?.name)}
          </Avatar>
          <Stack spacing={1}>
            {user ? (
              <>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "blueGrey.10",
                    fontStyle: "italic",
                  }}
                >
                  {user.email}
                </Typography>
              </>
            ) : (
              <>
                <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
                <Skeleton variant="text" sx={{ fontSize: "1rem" }} />
              </>
            )}
          </Stack>
        </Stack>
      </Paper>
      <Paper elevation={0} sx={{ borderRadius: 3 }}>
        <Stack direction="row">
          <List>
            <ListItem disablePadding>
              <NavigationButton
                buttonDescription={"Display Name"}
                selected={formType === "changename"}
                onClick={(event) => handleListItemClick(event, "changename")}
                Icon={AccountCircle}
                sx={{ pl: 1 }}
              />
            </ListItem>
            <ListItem disablePadding>
              <NavigationButton
                buttonDescription={"Password"}
                selected={formType === "changepassword"}
                onClick={(event) =>
                  handleListItemClick(event, "changepassword")
                }
                Icon={Lock}
                sx={{ pl: 1 }}
              />
            </ListItem>
          </List>
          <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
          {formType === "changename" ? (
            <ChangeDisplayName />
          ) : formType === "changepassword" ? (
            <ChangePassword />
          ) : null}
        </Stack>
      </Paper>
    </Stack>
  );
};
