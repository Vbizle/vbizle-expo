"use client";

import { useEffect, useRef } from "react";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * 🔥 Profesyonel Join Event Hook’u
 * - Minimize modunda asla join atmaz
 * - Zaten onlineUsers'ta varsa join atmaz
 * - Aynı ekranda tekrar tekrar tetiklenmez
 * - Refresh / back / forward durumlarına tam uyumlu
 */
export function useJoinMessage(
  roomId: string,
  user: any,
  profile: any,
  disablePresence: boolean
) {
  const fired = useRef(false); // ❗ Aynı ekranda tekrar join atmayı engeller

  useEffect(() => {
    if (!roomId || !user || !profile) return;

    // Minimize modunda join ASLA atılmasın
    if (disablePresence) return;

    // Aynı mount içinde tekrar tetiklenmesin
    if (fired.current) return;

    async function sendJoinIfNeeded() {
      try {
        if (!roomId) return;

        // 🔒 race condition önleme
        fired.current = true;

        const ref = doc(db, "rooms", roomId);
        const snap = await getDoc(ref);

        if (!snap.exists()) return;

        const data = snap.data();
        const list = Array.isArray(data.onlineUsers) ? data.onlineUsers : [];

        // Kullanıcı zaten listede → join event ATMAYIZ
        const alreadyInside = list.some((u) => u.uid === user.uid);
        if (alreadyInside) {
          return;
        }

        // Kullanıcı gerçekten ilk kez giriyor → join event gönder
        await addDoc(collection(db, "rooms", roomId, "chat"), {
          uid: user.uid,
          name: profile.username,
          photo: profile.avatar || null,
          type: "join",
          text: "joined_room_event_8392",
          time: serverTimestamp(),
        });
      } catch (err) {
        console.log("useJoinMessage ERROR:", err);
        fired.current = false; // ❗ hata olursa tekrar deneme şansı kalsın
      }
    }

    sendJoinIfNeeded();
  }, [roomId, user?.uid, profile?.username, profile?.avatar, disablePresence]);
}
