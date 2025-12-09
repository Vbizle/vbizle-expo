"use client";

import { useEffect, useRef } from "react";
import { RemoteParticipant, TrackPublication } from "livekit-client";

type TrackSyncConfig = {
  onVideo?: (identity: string, track: any) => void;
  onAudio?: (identity: string, track: any) => void;
  onVideoRemove?: (identity: string) => void;
  onAudioRemove?: (identity: string) => void;
};

export function useTrackSync(
  room: any,
  {
    onVideo,
    onAudio,
    onVideoRemove,
    onAudioRemove,
  }: TrackSyncConfig
) {
  // 🔥 Duplicate event spam protection
  const seenTracks = useRef(new Set<string>());

  useEffect(() => {
    if (!room) return;

    const normalizeId = (p: RemoteParticipant) =>
      p?.identity?.toString?.() || "";

    /* --------------------------------------------------------
       TRACK SUBSCRIBED
    -------------------------------------------------------- */
    const handleSub = (track: any, pub: TrackPublication, p: RemoteParticipant) => {
      const id = normalizeId(p);
      if (!id) return;

      const key = `${id}-${pub.trackSid}`;

      // 🔥 Aynı track 2 kez geliyorsa atla (LiveKit bazen yapıyor)
      if (seenTracks.current.has(key)) return;
      seenTracks.current.add(key);

      if (track.kind === "video") {
        try {
          onVideo?.(id, track);
        } catch (e) {
          console.warn("Video handler error:", e);
        }
      }

      if (track.kind === "audio") {
        try {
          onAudio?.(id, track);
        } catch (e) {
          console.warn("Audio handler error:", e);
        }
      }
    };

    /* --------------------------------------------------------
       TRACK UNSUBSCRIBED
    -------------------------------------------------------- */
    const handleUnsub = (pub: TrackPublication, p: RemoteParticipant) => {
      const id = normalizeId(p);
      if (!id) return;

      const key = `${id}-${pub.trackSid}`;
      seenTracks.current.delete(key);

      if (pub.kind === "video") {
        try {
          onVideoRemove?.(id);
        } catch (e) {
          console.warn("Video remove handler error:", e);
        }
      }

      if (pub.kind === "audio") {
        try {
          onAudioRemove?.(id);
        } catch (e) {
          console.warn("Audio remove handler error:", e);
        }
      }
    };

    /* --------------------------------------------------------
       LISTEN
    -------------------------------------------------------- */
    room.on("trackSubscribed", handleSub);
    room.on("trackUnsubscribed", handleUnsub);

    return () => {
      room.off("trackSubscribed", handleSub);
      room.off("trackUnsubscribed", handleUnsub);
      seenTracks.current.clear();
    };
  }, [room, onVideo, onAudio, onVideoRemove, onAudioRemove]);
}
