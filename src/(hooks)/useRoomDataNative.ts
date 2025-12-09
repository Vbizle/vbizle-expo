"use client";

import { useEffect, useRef, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export function useRoomData(roomId: string) {
  const [room, setRoom] = useState<any>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  // 🔥 Snapshot içinde tekrar tekrar update yapmayı önlemek için
  const initFixedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    let active = true;
    initFixedRef.current = false; // oda değişirse sıfırla

    const refRoom = doc(db, "rooms", roomId);

    const unsub = onSnapshot(refRoom, async (snap) => {
      if (!active) return; // component unmount olduysa durdur

      if (!snap.exists()) {
        setRoom(null);
        setLoadingRoom(false);
        return;
      }

      const d = snap.data() || {};

      /* --------------------------------------------------
         🔥 Bağış alanlarını ilk snapshot’ta otomatik ekle
         (LOOP OLUŞMASIN DİYE SADECE 1 KEZ)
      -------------------------------------------------- */
      if (!initFixedRef.current) {
        const missing: any = {};

        if (d.donationBarEnabled === undefined)
          missing.donationBarEnabled = false;

        if (d.donationTitle === undefined)
          missing.donationTitle = "1. Koltuk için bağış";

        if (d.donationTarget === undefined)
          missing.donationTarget = 500;

        if (d.donationCurrent === undefined)
          missing.donationCurrent = 0;

        if (Object.keys(missing).length > 0) {
          console.log("🔧 Bağış alanları ekleniyor:", missing);

          // 🔥 Snapshot loop olmaması için sadece 1 defa çalıştır
          initFixedRef.current = true;

          await updateDoc(refRoom, missing);
          // ❗ Burada return edilmiyor
          // Çünkü update sonrası snapshot tekrar gelecek
          // ve d yerine yeni değerleri set edecek
        } else {
          initFixedRef.current = true;
        }
      }

      /* --------------------------------------------------
         🔵 ROOM VERİSİNİ SET ET
      -------------------------------------------------- */
      setRoom({
        roomId,
        ...d,
      });

      setLoadingRoom(false);
    });

    return () => {
      active = false;
      unsub();
    };
  }, [roomId]);

  /* --------------------------------------------------
     🔵 DIŞARIDAN ROOM GÜNCELLEME API
  -------------------------------------------------- */
  async function updateRoomSettings(data: any) {
    if (!roomId) return;
    await updateDoc(doc(db, "rooms", roomId), data);
  }

  return {
    room,
    loadingRoom,
    updateRoomSettings,
  };
}
