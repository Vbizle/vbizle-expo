import { useEffect, useRef, useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

/**
 * Native YouTube Player Hook (React Native)
 * Web iframe API yerine react-native-youtube-iframe mantığıyla çalışır.
 */

export function useYoutubePlayerNative(room: any, user: any, roomId: string) {
  const playerRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const isHost = user?.uid === room?.ownerId;

  /* ---------------------------------------------------------
     📌 PLAYER READY OLUNCA SES VE BAŞLANGIÇ AYARLARI
  --------------------------------------------------------- */
  function onPlayerReady() {
    setIsReady(true);

    try {
      // Ses ayarı
      playerRef.current?.setVolume(room.videoVolume ?? 100);
    } catch {}
  }

  /* ---------------------------------------------------------
     📌 HOST → PLAY / PAUSE / ZAMAN SYNC Firestore’a İşle
  --------------------------------------------------------- */
  const onStateChange = async (state: string) => {
    if (!isHost) return;

    //  playing = "playing", paused = "paused"
    let playerState = 2; // pause
    if (state === "playing") playerState = 1;

    let cur = 0;
    try {
      cur = await playerRef.current?.getCurrentTime?.();
    } catch {}

    await updateDoc(doc(db, "rooms", roomId), {
      playerState,
      videoTime: cur,
      lastUpdate: serverTimestamp(),
    });
  };

  /* ---------------------------------------------------------
     📌 MİSAFİR → HOST İLE SENKRON
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isReady) return;
    if (isHost) return;

    let target = room.videoTime || 0;

    // Host’ın lastUpdate’ine göre drift düzeltme
    if (room.playerState === 1 && room.lastUpdate?.toMillis) {
      const delta = (Date.now() - room.lastUpdate.toMillis()) / 1000;
      target += delta;
    }

    (async () => {
      try {
        const cur = await playerRef.current?.getCurrentTime?.();
        if (!isNaN(cur) && Math.abs(cur - target) > 1) {
          playerRef.current?.seekTo(target, true);
        }

        if (room.playerState === 1) {
          playerRef.current?.playVideo?.();
        } else {
          playerRef.current?.pauseVideo?.();
        }
      } catch {}
    })();
  }, [room.videoTime, room.playerState, room.lastUpdate, isReady]);

  /* ---------------------------------------------------------
     📌 SES SYNC
  --------------------------------------------------------- */
  useEffect(() => {
    if (!isReady) return;

    try {
      playerRef.current?.setVolume(room.videoVolume ?? 100);
    } catch {}
  }, [room.videoVolume, isReady]);

  return {
    playerRef,
    onPlayerReady,
    onStateChange,
  };
}
