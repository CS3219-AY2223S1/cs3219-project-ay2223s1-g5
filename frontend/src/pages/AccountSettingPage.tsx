import { useState } from "react";
import { AccountCircle, Lock } from "@mui/icons-material";
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { UpdatePasswordForm } from "src/components/forms/UpdatePasswordForm";
import { PasswordRequirement } from "src/components/PasswordRequirement";
import { useAuth } from "src/contexts/AuthContext";

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
    <Paper elevation={1} sx={{ borderRadius: 3, mx: 6 }}>
      <Stack direction="row">
        <List>
          <ListItem disablePadding sx={{ bgcolor: "white" }}>
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
          <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
            <Stack spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Update Your Display Name
              </Typography>
              <Typography variant="body2">Personalize Your Name</Typography>
              <Typography variant="body2">
                Your display name should contain:
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "center" }}
              spacing={3}
            >
              <PasswordRequirement label="3+" description="Character" />
              <PasswordRequirement label="AA" description="Uppercase" />
              <PasswordRequirement label="aa" description="Lowercase" />
            </Stack>
            {/* To add change display name form here */}
            <UpdatePasswordForm userId={user?.userId || 0} />
          </Stack>
        ) : formType === "changepassword" ? (
          <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
            <Stack spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Update Your Password
              </Typography>
              <Typography variant="body2">
                Just type it twice and try not to forget it.
              </Typography>
              <Typography variant="body2">
                Your password should contain:
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: "center" }}
              spacing={3}
            >
              <PasswordRequirement label="8+" description="Character" />
              <PasswordRequirement label="AA" description="Uppercase" />
              <PasswordRequirement label="aa" description="Lowercase" />
              <PasswordRequirement label="@$#" description="Symbol" />
            </Stack>
            <UpdatePasswordForm userId={user?.userId || 0} />
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};
