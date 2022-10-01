import { Avatar, Stack, useTheme } from "@mui/material";

import { nameToInitials } from "src/utils/string";

import { StyledButton } from "./StyledButton";

type RoomStatusBarProps = {
  self: { name?: string; isConnected: boolean };
  participants: { name?: string; isConnected: boolean }[];
  onLeaveRoom: () => void;
};

export const RoomStatusBar = (props: RoomStatusBarProps) => {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent="space-between" sx={{ py: 2, px: 3 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Avatar
          sx={{
            width: "40px",
            height: "40px",
            bgcolor: "secondary.A700",
            fontSize: "14px",
            borderStyle: "solid",
            borderWidth: "3px",
            borderColor: props.self.isConnected
              ? theme.palette.green[500]
              : theme.palette.red[500],
          }}
        >
          {nameToInitials(props.self.name)}
        </Avatar>
        {props.participants.map((participant) => (
          <Avatar
            key={participant.name}
            sx={{
              width: "40px",
              height: "40px",
              bgcolor: "primary.A700",
              fontSize: "14px",
              borderStyle: "solid",
              borderWidth: "3px",
              borderColor: participant.isConnected
                ? theme.palette.green[500]
                : theme.palette.red[500],
            }}
          >
            {nameToInitials(participant.name)}
          </Avatar>
        ))}
      </Stack>
      <StyledButton
        label={"Leave Room"}
        sx={{
          bgcolor: "red.500",
          "&:hover": {
            bgcolor: "red.700",
            boxShadow: "1",
          },
        }}
        onClick={props.onLeaveRoom}
      />
    </Stack>
  );
};
