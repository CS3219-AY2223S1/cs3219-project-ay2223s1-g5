import { Circle } from "@mui/icons-material";
import { Avatar, Stack, Typography, useTheme } from "@mui/material";

import { StyledButton } from "src/components/StyledButton";
import { useChat } from "src/contexts/ChatContext";
import { useEditor } from "src/contexts/EditorContext";
import { nameToInitials } from "src/utils/string";

type RoomStatusBarProps = {
  self: { name?: string; isConnected: boolean };
  participants: { name?: string; isConnected: boolean }[];
  onLeaveRoom: () => void;
};

export const RoomStatusBar = (props: RoomStatusBarProps) => {
  const { isConnected: isEditorConnected } = useEditor();
  const { isConnected: isChatConnected } = useChat();
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
      <Stack
        direction="row"
        spacing={3}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <Typography
            fontWeight={100}
            fontSize="1.2rem"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Circle
              sx={{
                height: "12px",
                width: "12px",
                color: isEditorConnected
                  ? theme.palette.green[500]
                  : theme.palette.red[500],
                mr: 1,
              }}
            />
            Editor
          </Typography>
          <Typography
            fontWeight={100}
            fontSize="1.2rem"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Circle
              sx={{
                height: "12px",
                width: "12px",
                color: isChatConnected
                  ? theme.palette.green[500]
                  : theme.palette.red[500],
                mr: 1,
              }}
            />
            Chat
          </Typography>
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
    </Stack>
  );
};
