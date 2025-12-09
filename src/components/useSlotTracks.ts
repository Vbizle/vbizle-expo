import { useEffect, useState, useRef } from "react";
import {
  Track,
  LocalVideoTrack,
  LocalAudioTrack,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "@livekit/react-native";

export default function useSlotTracks({
  lkRoom,
  room,
  currentUid,
  hostUid,
  guestUid,
  audioSeat1,
  audioSeat2,
}) {
  // --------------------------------------------------------
  // LOCAL TRACKS
  // --------------------------------------------------------
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<LocalAudioTrack | null>(null);

  // Remote video tracks (host + guest)
  const [remoteHostVideo, setRemoteHostVideo] = useState(null);
  const [remoteGuestVideo, setRemoteGuestVideo] = useState(null);

  // Remote audio seats
  const [audio1Track, setAudio1Track] = useState(null);
  const [audio2Track, setAudio2Track] = useState(null);

  const isHost = currentUid === hostUid;
  const isGuest = currentUid === guestUid;
  const isA1 = currentUid === audioSeat1.uid;
  const isA2 = currentUid === audioSeat2.uid;

  const creatingTracks = useRef(false);

  // --------------------------------------------------------
  // PUBLISH/UNPUBLISH TRACK SAFE FUNCTION
  // --------------------------------------------------------
  async function publishSafe(track) {
    try {
      await lkRoom?.localParticipant?.publishTrack(track);
    } catch (e) {
      console.log("⚠ publishTrack error:", e);
    }
  }

  async function unpublishSafe(track) {
    try {
      await lkRoom?.localParticipant?.unpublishTrack(track);
    } catch (e) {
      console.log("⚠ unpublishTrack error:", e);
    }
  }

  // --------------------------------------------------------
  // CREATE / REMOVE LOCAL TRACKS
  // --------------------------------------------------------
  async function ensureLocalTracks() {
    if (!lkRoom || creatingTracks.current) return;
    creatingTracks.current = true;

    try {
      // ---------------- CAM ----------------
      const wantCam =
        isHost ? room.hostState?.camera :
        isGuest ? room.guestState?.camera : false;

      if (wantCam && !localVideoTrack) {
        const video = await createLocalVideoTrack();
        setLocalVideoTrack(video);
        publishSafe(video);
      }

      if (!wantCam && localVideoTrack) {
        unpublishSafe(localVideoTrack);
        setLocalVideoTrack(null);
      }

      // ---------------- MIC ----------------
      let wantMic = false;
      if (isHost) wantMic = room.hostState?.mic;
      else if (isGuest) wantMic = room.guestState?.mic;
      else if (isA1) wantMic = audioSeat1.mic && !audioSeat1.hostMute;
      else if (isA2) wantMic = audioSeat2.mic && !audioSeat2.hostMute;

      if (wantMic && !localAudioTrack) {
        const audio = await createLocalAudioTrack();
        setLocalAudioTrack(audio);
        publishSafe(audio);
      }

      if (!wantMic && localAudioTrack) {
        unpublishSafe(localAudioTrack);
        setLocalAudioTrack(null);
      }

    } finally {
      creatingTracks.current = false;
    }
  }

  // WATCH ROOM STATE CHANGES → UPDATE TRACKS
  useEffect(() => {
    ensureLocalTracks();
  }, [
    lkRoom,
    room.hostState,
    room.guestState,
    audioSeat1,
    audioSeat2,
  ]);

  // --------------------------------------------------------
  // TRACK SUBSCRIBE EVENTS (REMOTE)
  // --------------------------------------------------------
  useEffect(() => {
    if (!lkRoom) return;

    const sub = (track, publication, participant) => {
      const id = participant.identity;

      if (track.source === Track.Source.Camera) {
        if (id === hostUid) setRemoteHostVideo(track);
        if (id === guestUid) setRemoteGuestVideo(track);
      }

      if (track.source === Track.Source.Microphone) {
        if (id === audioSeat1.uid) setAudio1Track(track);
        if (id === audioSeat2.uid) setAudio2Track(track);
      }
    };

    const unsub = (track, publication, participant) => {
      const id = participant.identity;

      if (id === hostUid) setRemoteHostVideo(null);
      if (id === guestUid) setRemoteGuestVideo(null);

      if (id === audioSeat1.uid) setAudio1Track(null);
      if (id === audioSeat2.uid) setAudio2Track(null);
    };

    lkRoom.on("trackSubscribed", sub);
    lkRoom.on("trackUnsubscribed", unsub);

    return () => {
      lkRoom.off("trackSubscribed", sub);
      lkRoom.off("trackUnsubscribed", unsub);
    };
  }, [lkRoom, hostUid, guestUid, audioSeat1.uid, audioSeat2.uid]);

  // --------------------------------------------------------
  // RECONNECT → LOCAL TRACKS YENİDEN PUBLISH
  // --------------------------------------------------------
  useEffect(() => {
    if (!lkRoom) return;

    const onRec = () => {
      console.log("🔄 LiveKit Reconnected → Re-publish local tracks");

      if (localVideoTrack) publishSafe(localVideoTrack);
      if (localAudioTrack) publishSafe(localAudioTrack);
    };

    lkRoom.on("reconnected", onRec);
    return () => lkRoom.off("reconnected", onRec);
  }, [lkRoom, localVideoTrack, localAudioTrack]);

  return {
    localVideoTrack,
    localAudioTrack,

    remoteHostVideo,
    remoteGuestVideo,

    audio1Track,
    audio2Track,
  };
}
