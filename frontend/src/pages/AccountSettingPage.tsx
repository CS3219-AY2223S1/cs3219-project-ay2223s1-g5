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
            <ListItemButton
              selected={formType === "changename"}
              onClick={(event) => handleListItemClick(event, "changename")}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "white",
                  color: "primary.500",
                },
              }}
            >
              <ListItemIcon>
                <AccountCircle
                  sx={{
                    color:
                      formType === "changename"
                        ? "primary.500"
                        : "blueGrey.500",
                  }}
                />
              </ListItemIcon>
              <ListItemText primary="Display Name" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={formType === "changepassword"}
              onClick={(event) => handleListItemClick(event, "changepassword")}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "white",
                  color: "primary.500",
                },
              }}
            >
              <ListItemIcon>
                <Lock
                  sx={{
                    color:
                      formType === "changepassword"
                        ? "primary.500"
                        : "blueGrey.500",
                  }}
                />
              </ListItemIcon>
              <ListItemText primary="Password" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider orientation="vertical" flexItem sx={{ mr: "-1px" }} />
        {formType === "changename" ? (
          <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
            <Stack spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Update Display Name
              </Typography>
              <Typography variant="body2">Personalize Your Name</Typography>
              <Typography variant="body2">
                Display Name must contain:
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
            </Stack>
            {/* To add change display name form here */}
            <UpdatePasswordForm userId={user?.userId || 0} />
          </Stack>
        ) : formType === "changepassword" ? (
          <Stack spacing={4} sx={{ py: "20px", pl: 6, width: "60%" }}>
            <Stack spacing={0.5}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Reset Password
              </Typography>
              <Typography variant="body2">
                Just type it twice and try not to forget it.
              </Typography>
              <Typography variant="body2">
                Password should be and must contain:
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
