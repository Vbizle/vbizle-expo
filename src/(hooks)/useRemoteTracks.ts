"use client";

import { useEffect, useState, useRef } from "react";
import { RemoteParticipant, Track, TrackPublication } from "livekit-client";

export function useRemoteTracks({
  lkRoom,
  room,
  hostUid,
  guestUid,
  audio1Uid,
  audio2Uid,
  audio1Mic,
  audio2Mic,
  audioSeat1HostMute,
  audioSeat2HostMute,
}: any) {
  const [hostVideo, setHostVideo] = useState<any>(null);
  const [guestVideo, setGuestVideo] = useState<any>(null);

  const [audio1Track, setAudio1Track] = useState<any>(null);
  const [audio2Track, setAudio2Track] = useState<any>(null);

  // 🔥 Mobil için global audio element cache
  const audioEls = useRef<Record<string, HTMLAudioElement>>({});

  function ensureAudioElement(id: string) {
    if (audioEls.current[id]) return audioEls.current[id];

    const el = document.createElement("audio");
    el.id = "audio-" + id;
    el.autoplay = true;
    el.muted = false;
    el.playsInline = true;
    el.style.display = "none";

    document.body.appendChild(el);
    audioEls.current[id] = el;

    return el;
  }

  function removeAudioElement(id: string) {
    const el = audioEls.current[id];
    if (el) {
      try {
        el.pause();
      } catch {}
      el.remove();
      delete audioEls.current[id];
    }
  }

  /* -------------------------------------------------------
     🔥 TRACK SUBSCRIBE / UNSUBSCRIBE
  ------------------------------------------------------- */
  useEffect(() => {
    if (!lkRoom) return;

    const onSub = (
      track: Track,
      pub: TrackPublication,
      participant: RemoteParticipant
    ) => {
      const id = participant.identity?.toString?.() || "";

      /* ---------------- VIDEO ---------------- */
      if (track.kind === "video") {
        if (id === hostUid) setHostVideo(track);
        if (id === guestUid) setGuestVideo(track);
      }

      /* ---------------- AUDIO ---------------- */
      if (track.kind === "audio") {
        removeAudioElement(id); // eski varsa sil → çakışmasın

        // 🔥 Kullanıcı o anda MIKROFONU aktif mi?
        let allow = false;
        if (id === hostUid) allow = room.hostState?.mic;
        if (id === guestUid) allow = room.guestState?.mic;
        if (id === audio1Uid) allow = audio1Mic && !audioSeat1HostMute;
        if (id === audio2Uid) allow = audio2Mic && !audioSeat2HostMute;

        if (!allow) return;

        const el = ensureAudioElement(id);

        try {
          track.attach(el);
        } catch {}

        if (id === audio1Uid) setAudio1Track(track);
        if (id === audio2Uid) setAudio2Track(track);
      }
    };

    const onUnsub = (
      pub: TrackPublication,
      participant: RemoteParticipant
    ) => {
      const id = participant.identity?.toString?.() || "";

      removeAudioElement(id);

      if (pub.kind === "video") {
        if (id === hostUid) setHostVideo(null);
        if (id === guestUid) setGuestVideo(null);
      }

      if (pub.kind === "audio") {
        if (id === audio1Uid) setAudio1Track(null);
        if (id === audio2Uid) setAudio2Track(null);
      }
    };

    lkRoom.on("trackSubscribed", onSub);
    lkRoom.on("trackUnsubscribed", onUnsub);

    return () => {
      lkRoom.off("trackSubscribed", onSub);
      lkRoom.off("trackUnsubscribed", onUnsub);
    };
  }, [
    lkRoom,
    hostUid,
    guestUid,
    audio1Uid,
    audio2Uid,
    audio1Mic,
    audio2Mic,
    audioSeat1HostMute,
    audioSeat2HostMute,
    room.hostState,
    room.guestState,
  ]);

  /* -------------------------------------------------------
     🔄 SLOT DEĞİŞİMİ → ESKİ TRACK’LERİ SIFIRLA
  ------------------------------------------------------- */
  useEffect(() => {
    setHostVideo(null);
    setGuestVideo(null);
    setAudio1Track(null);
    setAudio2Track(null);
  }, [hostUid, guestUid, audio1Uid, audio2Uid]);

  /* -------------------------------------------------------
     🔥 RECONNECT RESTORE
  ------------------------------------------------------- */
  useEffect(() => {
    if (!lkRoom) return;
    const onRec = () => {
      console.log("🔁 LiveKit reconnect → remote tracks restore");
      setHostVideo((t) => t);
      setGuestVideo((t) => t);
      setAudio1Track((t) => t);
      setAudio2Track((t) => t);
    };

    lkRoom.on("reconnected", onRec);
    return () => lkRoom.off("reconnected", onRec);
  }, [lkRoom]);

  return {
    hostVideo,
    guestVideo,
    audio1Track,
    audio2Track,
  };
}
