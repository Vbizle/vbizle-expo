// ⭐ EXPO / React Native uyumlu track router
// Web tarafındaki "use client" kaldırıldı — Expo'da gereksizdir.

export function setupTrackRouter({
  room,
  hostUid,
  guestUid,
  setRemoteHostVideo,
  setRemoteGuestVideo,
}: {
  room: any;
  hostUid: string;
  guestUid: string;
  setRemoteHostVideo: (track: any | null) => void;
  setRemoteGuestVideo: (track: any | null) => void;
}) {
  if (!room) return () => {};

  /* ---------------------------------------------
     TRACK SUBSCRIBED
  --------------------------------------------- */
  function onTrackSubscribed(track: any, pub: any, participant: any) {
    const id = participant?.identity?.toString() || "";

    // 🔥 HOST video
    if (id === hostUid && track.kind === "video") {
      console.log("📥 [EXPO] Host video subscribed");
      setRemoteHostVideo(track);
    }

    // 🔥 GUEST video
    if (id === guestUid && track.kind === "video") {
      console.log("📥 [EXPO] Guest video subscribed");
      setRemoteGuestVideo(track);
    }
  }

  /* ---------------------------------------------
     TRACK UNSUBSCRIBED
  --------------------------------------------- */
  function onTrackUnsubscribed(pub: any, participant: any) {
    const id = participant?.identity?.toString() || "";

    if (id === hostUid && pub.kind === "video") {
      console.log("❌ [EXPO] Host video unsubscribed");
      setRemoteHostVideo(null);
    }

    if (id === guestUid && pub.kind === "video") {
      console.log("❌ [EXPO] Guest video unsubscribed");
      setRemoteGuestVideo(null);
    }
  }

  // 🔗 Event bağlama
  room.on("trackSubscribed", onTrackSubscribed);
  room.on("trackUnsubscribed", onTrackUnsubscribed);

  // 🧼 Temizlik
  return () => {
    room.off("trackSubscribed", onTrackSubscribed);
    room.off("trackUnsubscribed", onTrackUnsubscribed);
  };
}
