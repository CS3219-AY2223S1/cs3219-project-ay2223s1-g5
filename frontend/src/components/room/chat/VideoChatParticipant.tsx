import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import {
  AudioTrack,
  AudioTrackPublication,
  LocalParticipant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteVideoTrack,
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

export const VideoChatParticipant = ({
  participant,
}: {
  participant: RemoteParticipant | LocalParticipant;
}) => {
  const [videoTrack, setVideoTrack] = useState<VideoTrack | undefined>(
    undefined,
  );
  const [audioTrack, setAudioTrack] = useState<AudioTrack | undefined>(
    undefined,
  );

  const [refAttached, setRefAttached] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setVideoTrack(videoTrackPublicationsToTrack(participant.videoTracks));
    setAudioTrack(audioTrackPublicationsToTrack(participant.audioTracks));
    participant.on("trackSubscribed", (track) => {
      if (track.kind === "video") {
        setVideoTrack(track as VideoTrack);
      }
      if (track.kind === "audio") {
        setAudioTrack(track as AudioTrack);
      }
    });

    participant.on("trackUnsubscribed", (track) => {
      if (track.kind === "video") {
        setVideoTrack((current) => {
          if ((current as unknown as RemoteVideoTrack).sid === track.sid) {
            return undefined;
          }
          return current;
        });
      }
      if (track.kind === "audio") {
        setAudioTrack((current) => {
          if ((current as unknown as RemoteAudioTrack).sid === track.sid) {
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
    if (!videoTrack || !videoRef.current) {
      return;
    }
    videoTrack.attach(videoRef.current);
    return () => {
      videoTrack.detach();
    };
  }, [videoTrack, refAttached]);

  useEffect(() => {
    if (!audioTrack || !audioRef.current) {
      return;
    }
    audioTrack.attach(audioRef.current);
    return () => {
      audioTrack.detach();
    };
  }, [audioTrack]);

  return (
    <Box sx={{ flex: 1, maxHeight: "100%" }}>
      <video
        ref={(ref) => {
          videoRef.current = ref;
          setRefAttached(1);
        }}
        width="100%"
        height="100%"
        autoPlay={true}
        muted={true}
        playsInline={true}
      />
      <audio ref={audioRef} autoPlay={true} muted={false} />
    </Box>
  );
};
