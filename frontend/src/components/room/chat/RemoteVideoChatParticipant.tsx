import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, Box } from "@mui/material";
import {
  RemoteAudioTrack,
  RemoteAudioTrackPublication,
  RemoteParticipant,
  RemoteVideoTrack,
  RemoteVideoTrackPublication,
} from "twilio-video";

import { Center } from "src/components/Center";

const audioTrackPublicationsToTrack = (
  trackPublications: Map<string, RemoteAudioTrackPublication>,
): RemoteAudioTrack | undefined => {
  return (
    Array.from(trackPublications.values())
      .map((trackPublication) => trackPublication.track)
      .filter((track) => !!track)[0] || undefined
  );
};

const videoTrackPublicationsToTrack = (
  trackPublications: Map<string, RemoteVideoTrackPublication>,
): RemoteVideoTrack | undefined => {
  return (
    Array.from(trackPublications.values())
      .map((trackPublication) => trackPublication.track)
      .filter((track) => !!track)[0] || undefined
  );
};

export const RemoteVideoChatParticipant = ({
  participant,
  isMuted,
}: {
  participant: RemoteParticipant;
  isMuted: boolean;
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(false);
  const [videoTrack, setVideoTrack] = useState<RemoteVideoTrack | undefined>(
    undefined,
  );
  const [audioTrack, setAudioTrack] = useState<RemoteAudioTrack | undefined>(
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
    setVideoTrack(videoTrackPublicationsToTrack(participant.videoTracks));
    setAudioTrack(audioTrackPublicationsToTrack(participant.audioTracks));
    participant.on("trackSubscribed", (track) => {
      if (track.kind === "video") {
        setVideoTrack(track as RemoteVideoTrack);
      }
      if (track.kind === "audio") {
        setAudioTrack(track as RemoteAudioTrack);
      }
    });

    participant.on("trackUnsubscribed", (track) => {
      if (track.kind === "video") {
        setVideoTrack((current) => {
          if (current?.sid === track.sid) {
            return undefined;
          }
          return current;
        });
      }
      if (track.kind === "audio") {
        setAudioTrack((current) => {
          if (current?.sid === track.sid) {
            return undefined;
          }
          return current;
        });
      }
    });

    return () => {
      setVideoTrack(undefined);
      setAudioTrack(undefined);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    if (!videoTrack) {
      return;
    }
    setIsVideoEnabled(videoTrack.isEnabled);
    videoTrack.on("enabled", () => {
      setIsVideoEnabled(true);
    });
    videoTrack.on("disabled", () => {
      setIsVideoEnabled(false);
    });
  }, [videoTrack, setIsVideoEnabled]);

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

  return isVideoEnabled ? (
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <video
        ref={videoCallbackRef}
        height="100%"
        width="100%"
        autoPlay={true}
        muted={true}
        playsInline={true}
      />
      <audio ref={audioCallbackRef} autoPlay={true} muted={isMuted} />
    </Box>
  ) : (
    <Center>
      <Avatar />
    </Center>
  );
};
