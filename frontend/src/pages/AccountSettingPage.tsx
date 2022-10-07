import { useState } from "react";
import { AccountCircle, Lock } from "@mui/icons-material";
import { Divider, List, ListItem, Paper, Stack } from "@mui/material";

import { NavigationButton } from "src/components/NavigationButton";
import { ChangeDisplayName } from "src/components/settings/ChangeDisplayName";
import { ChangePassword } from "src/components/settings/ChangePassword";

export const AccountSettingPage = () => {
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
    <Paper elevation={1} sx={{ borderRadius: 3, mx: 6 }}>
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
              onClick={(event) => handleListItemClick(event, "changepassword")}
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
  );
};
