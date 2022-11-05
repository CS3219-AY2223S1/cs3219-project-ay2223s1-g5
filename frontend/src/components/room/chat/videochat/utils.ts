import {
  AudioTrack,
  AudioTrackPublication,
  RemoteAudioTrack,
  RemoteAudioTrackPublication,
  RemoteVideoTrack,
  RemoteVideoTrackPublication,
  VideoTrack,
  VideoTrackPublication,
} from "twilio-video";

export function trackPublicationToTrack(
  trackPublications: Map<string, RemoteVideoTrackPublication>,
): RemoteVideoTrack | undefined;
export function trackPublicationToTrack(
  trackPublications: Map<string, RemoteAudioTrackPublication>,
): RemoteAudioTrack | undefined;
export function trackPublicationToTrack(
  trackPublications: Map<string, VideoTrackPublication>,
): VideoTrack | undefined;
export function trackPublicationToTrack(
  trackPublications: Map<string, AudioTrackPublication>,
): AudioTrack | undefined;

export function trackPublicationToTrack(
  trackPublications:
    | Map<string, RemoteVideoTrackPublication>
    | Map<string, RemoteAudioTrackPublication>
    | Map<string, VideoTrackPublication>
    | Map<string, AudioTrackPublication>,
): RemoteVideoTrack | RemoteAudioTrack | VideoTrack | AudioTrack | undefined {
  const tracks = [...trackPublications.values()]
    .map((trackPublication) => trackPublication.track)
    .filter((track) => !!track);
  return tracks[0] || undefined;
}
