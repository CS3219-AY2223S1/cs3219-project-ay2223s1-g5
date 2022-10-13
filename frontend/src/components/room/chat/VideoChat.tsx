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
export const VideoChat = memo(
  ({ name, partnerName }: { name?: string; partnerName?: string }) => {
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

    return isVideoChatEnabled ? (
      <Stack spacing={1} sx={{ height: "100%" }}>
        <Grid container sx={{ flex: 1 }}>
          {/* Material UI uses negative margins to achieve spacing and that 
         affects our video layout so we hack around it. */}
          <Grid xs={5.75} item>
            <LocalVideoChatParticipant
              name={name}
              participant={selfVideoParticipant}
            />
          </Grid>
          <Grid xs={0.5} />
          <Grid xs={5.75} item sx={{ position: "relative", flex: 1 }}>
            <RemoteVideoChatParticipant
              name={partnerName}
              participant={partner}
              isMuted={isMuted}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <IconButton
              size="small"
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            >
              {isVideoEnabled ? (
                <VideocamOutlined fontSize="small" color="error" />
              ) : (
                <VideocamOffOutlined fontSize="small" />
              )}
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            >
              {isAudioEnabled ? (
                <MicOutlined fontSize="small" color="error" />
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
              <VolumeOffOutlined fontSize="small" color="warning" />
            ) : (
              <VolumeUpOutlined fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Stack>
    ) : (
      <Center>
        <Button onClick={enableVideoChat}>Enable Video Chat</Button>
      </Center>
    );
  },
);
