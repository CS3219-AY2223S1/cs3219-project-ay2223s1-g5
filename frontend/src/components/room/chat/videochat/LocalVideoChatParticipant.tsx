import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { AudioTrack, LocalParticipant, VideoTrack } from "twilio-video";

import { Center } from "src/components/Center";

import { trackPublicationToTrack } from "./utils";

export const LocalVideoChatParticipant = ({
  name,
  participant,
}: {
  name?: string;
  participant?: LocalParticipant;
}) => {
  const [videoTrack, setVideoTrack] = useState<VideoTrack | undefined>(
    undefined,
  );
  const [audioTrack, setAudioTrack] = useState<AudioTrack | undefined>(
    undefined,
  );

  const [videoRefVersion, setVideoRefVersion] = useState<number>(0);
  const [audioRefVersion, setAudioRefVersion] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const videoCallbackRef = useCallback(
    (ref: HTMLVideoElement | null) => {
      if (!ref) {
        return;
      }
      videoRef.current = ref;
      setVideoRefVersion((version) => version + 1);
    },
    [setVideoRefVersion],
  );

  const audioCallbackRef = useCallback(
    (ref?: HTMLAudioElement | null) => {
      if (!ref) {
        return;
      }
      audioRef.current = ref;
      setAudioRefVersion((version) => version + 1);
    },
    [setAudioRefVersion],
  );

  useEffect(() => {
    if (!participant) {
      return;
    }

    setVideoTrack(trackPublicationToTrack(participant.videoTracks));
    setAudioTrack(trackPublicationToTrack(participant.audioTracks));

    return () => {
      setVideoTrack(undefined);
      setAudioTrack(undefined);
    };
  }, [participant]);

  useEffect(() => {
    if (!videoTrack || !videoRef.current) {
      return;
    }
    videoTrack.attach(videoRef.current);
    return () => {
      videoTrack.detach();
    };
  }, [videoTrack, videoRefVersion]);

  useEffect(() => {
    if (!audioTrack || !audioRef.current) {
      return;
    }
    audioTrack.attach(audioRef.current);
    return () => {
      audioTrack.detach();
    };
  }, [audioTrack, audioRefVersion]);

  return (
    <Stack sx={{ height: "100%" }}>
      <Typography textAlign="center">{name || "\u00A0"}</Typography>
      <Box sx={{ height: "100%", position: "relative" }}>
        <Box
          sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {videoTrack ? (
            <video
              ref={videoCallbackRef}
              height="100%"
              width="100%"
              autoPlay={true}
              muted={true}
              playsInline={true}
            />
          ) : (
            <Center>
              <CircularProgress />
            </Center>
          )}
          <audio ref={audioCallbackRef} autoPlay={true} muted={true} />
        </Box>
      </Box>
    </Stack>
  );
};
