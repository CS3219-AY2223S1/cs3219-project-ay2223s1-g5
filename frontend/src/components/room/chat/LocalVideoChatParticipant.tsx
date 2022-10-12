import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  AudioTrack,
  AudioTrackPublication,
  LocalParticipant,
  VideoTrack,
  VideoTrackPublication,
} from "twilio-video";

const audioTrackPublicationsToTrack = (
  trackPublications: Map<string, AudioTrackPublication>,
): AudioTrack | undefined => {
  return (
    Array.from(trackPublications.values())
      .map((trackPublication) => trackPublication.track)
      .filter((track) => !!track)[0] || undefined
  );
};

const videoTrackPublicationsToTrack = (
  trackPublications: Map<string, VideoTrackPublication>,
): VideoTrack | undefined => {
  return (
    Array.from(trackPublications.values())
      .map((trackPublication) => trackPublication.track)
      .filter((track) => !!track)[0] || undefined
  );
};

export const LocalVideoChatParticipant = ({
  participant,
}: {
  participant: LocalParticipant;
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
    setVideoTrack(videoTrackPublicationsToTrack(participant.videoTracks));
    setAudioTrack(audioTrackPublicationsToTrack(participant.audioTracks));

    return () => {
      setVideoTrack(undefined);
      setAudioTrack(undefined);
      participant.removeAllListeners();
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
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <video
        ref={videoCallbackRef}
        height="100%"
        width="100%"
        autoPlay={true}
        muted={true}
        playsInline={true}
      />
      <audio ref={audioCallbackRef} autoPlay={true} muted={true} />
    </Box>
  );
};
