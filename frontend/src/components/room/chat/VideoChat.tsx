import { memo, useEffect, useMemo, useState } from "react";
import {
  MicOffOutlined,
  MicOutlined,
  VideocamOffOutlined,
  VideocamOutlined,
  VolumeOffOutlined,
  VolumeUpOutlined,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
} from "@mui/material";

import { Center } from "src/components/Center";
import { useChat } from "src/contexts/ChatContext";

import { LocalVideoChatParticipant } from "./LocalVideoChatParticipant";
import { RemoteVideoChatParticipant } from "./RemoteVideoChatParticipant";

// eslint-disable-next-line react/display-name
export const VideoChat = memo(() => {
  const {
    isVideoChatEnabled,
    enableVideoChat,
    selfVideoParticipant,
    videoParticipants,
    isAudioEnabled,
    setIsAudioEnabled,
    isVideoEnabled,
    setIsVideoEnabled,
  } = useChat();

  const [isMuted, setIsMuted] = useState<boolean>(false);

  const partner = useMemo(
    () => Array.from(videoParticipants.values())[0],
    [videoParticipants],
  );

  useEffect(() => {
    console.log("mounted");
    return () => console.log("unmounted");
  }, []);

  return isVideoChatEnabled ? (
    <Grid container spacing={1} sx={{ height: "100%" }}>
      <Grid xs={6} item sx={{ position: "relative", height: "100%" }}>
        {selfVideoParticipant ? (
          <LocalVideoChatParticipant participant={selfVideoParticipant} />
        ) : (
          <Center>Loading...</Center>
        )}
      </Grid>
      <Grid xs={6} item sx={{ position: "relative", height: "100%" }}>
        {partner ? (
          <RemoteVideoChatParticipant participant={partner} isMuted={isMuted} />
        ) : (
          <Center>
            <CircularProgress />
          </Center>
        )}
      </Grid>
      <Grid item xs={12} sx={{ height: "40px" }}>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <IconButton
              size="small"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? (
                <VideocamOutlined fontSize="small" />
              ) : (
                <VideocamOffOutlined fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
              {isAudioEnabled ? (
                <MicOutlined fontSize="small" />
              ) : (
                <MicOffOutlined fontSize="small" />
              )}
            </IconButton>
          </Stack>
          <IconButton
            size="small"
            onClick={() => setIsMuted((muted) => !muted)}
          >
            {isMuted ? (
              <VolumeOffOutlined fontSize="small" />
            ) : (
              <VolumeUpOutlined fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Grid>
    </Grid>
  ) : (
    <Center>
      <Button onClick={enableVideoChat}>Enable Video Chat</Button>
    </Center>
  );
});
