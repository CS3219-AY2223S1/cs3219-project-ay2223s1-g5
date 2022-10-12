import { Stack } from "@mui/material";

import { useChat } from "src/contexts/ChatContext";

import { VideoChatParticipant } from "./VideoChatParticipant";

export const VideoChat = () => {
  const { selfVideoParticipant, videoParticipants } = useChat();

  return (
    <Stack
      spacing={1}
      direction="row"
      sx={{ height: "100%", maxHeight: "100%" }}
    >
      {selfVideoParticipant && (
        <VideoChatParticipant participant={selfVideoParticipant} />
      )}
      {Array.from(videoParticipants.values()).map((participant) => (
        <VideoChatParticipant key={participant.sid} participant={participant} />
      ))}
    </Stack>
  );
};
