"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase/firebaseConfig";

export function useSendMessage(roomId: string, user: any, profile: any) {
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  async function sendMessage() {
    if (sending) return; // 🔥 Çift göndermeyi engelle
    if (!newMsg.trim()) return;
    if (!user || !profile) return;

    // 🔒 roomId güvenliği (native crash önleme)
    if (typeof roomId !== "string" || roomId.length === 0) return;

    // 🔥 Çok uzun mesaj engeli (kod bozmaz, sadece güvenlik)
    const text = newMsg.trim().slice(0, 500);

    setSending(true);

    try {
      await addDoc(collection(db, "rooms", roomId, "chat"), {
        uid: user.uid,
        name: profile.username,
        photo: profile.avatar,
        text,
        time: serverTimestamp(),
        type: "text",
      });

      setNewMsg("");
    } catch (err) {
      console.error("❌ Mesaj gönderme hatası:", err);
    }

    setSending(false);
  }

  return {
    newMsg,
    setNewMsg,
    sendMessage,
    sending, // UI'da istersen kullan
  };
}
