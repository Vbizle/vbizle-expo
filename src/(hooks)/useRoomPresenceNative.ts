"use client";

import { useEffect, useRef } from "react";
import { db } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useUiState } from "@/src/(providers)/UiProvider";

import AsyncStorage from "@react-native-async-storage/async-storage";

export function useRoomPresence(
  roomId: string,
  user: any,
  profile: any,
  disablePresence: boolean
) {
  const { isMinimized } = useUiState();

  // 🔥 Bu sayfada join işlemi sadece 1 defa çalışsın
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!roomId || !user || !profile) return;
    const currentUid = user.uid as string;

    /* -----------------------------------------------------
       🔥 1) Kullanıcı minimize durumundaysa → kesinlikle dokunma
    ----------------------------------------------------- */
    if (isMinimized) return;
    if (disablePresence) return;

    /* -----------------------------------------------------
       🔥 2) Önceki odadan güvenli şekilde düşür
    ----------------------------------------------------- */
    async function leavePreviousRoom() {
      try {
        const lastRoom = await AsyncStorage.getItem("lastRoomId");
        if (!lastRoom || lastRoom === roomId) return;

        const prevRef = doc(db, "rooms", lastRoom);
        const snap = await getDoc(prevRef);
        if (!snap.exists()) return;

        const data = snap.data();
        const list = Array.isArray(data.onlineUsers) ? data.onlineUsers : [];
        const updated = list.filter((u) => u.uid !== currentUid);

        // Zaten yoksa güncelleme yapma
        if (updated.length === list.length) return;

        await updateDoc(prevRef, {
          onlineUsers: updated,
          onlineCount: updated.length,
        });

        // Temizle
        await AsyncStorage.removeItem("lastRoomId");
      } catch (err) {
        console.log("leavePreviousRoom ERROR:", err);
      }
    }

    leavePreviousRoom();

    /* -----------------------------------------------------
       🔥 3) Aynı odada tekrar tekrar join atmayı engelle
    ----------------------------------------------------- */
    async function joinCurrentRoom() {
      try {
        if (joinedRef.current) return;
        joinedRef.current = true;

        const ref = doc(db, "rooms", roomId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data();
        const list = Array.isArray(data.onlineUsers) ? data.onlineUsers : [];

        // Zaten odadaysa join gönderme
        if (list.some((u) => u.uid === currentUid)) {
          await AsyncStorage.setItem("lastRoomId", roomId);
          return;
        }

        const updated = [
          ...list,
          {
            uid: currentUid,
            name: profile.username,
            photo: profile.avatar,
          },
        ];

        // 🔥 Güvenli join
        await updateDoc(ref, {
          onlineUsers: updated,
          onlineCount: updated.length,
        });

        // 🔥 Join tamamlandı → kaydet
        await AsyncStorage.setItem("lastRoomId", roomId);
      } catch (err) {
        console.log("joinCurrentRoom ERROR:", err);
      }
    }

    joinCurrentRoom();

    /* -----------------------------------------------------
       ❗ UNMOUNT → leave yok
       aynen eskisi gibi davranıyoruz
    ----------------------------------------------------- */
  }, [
    roomId,
    user?.uid,
    profile?.username,
    profile?.avatar,
    isMinimized,
    disablePresence,
  ]);
}
