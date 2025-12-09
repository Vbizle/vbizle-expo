"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export function useMessages(roomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    const ref = collection(db, "rooms", roomId, "chat");

    const q = query(ref, orderBy("time", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: any[] = [];

        snap.forEach((doc) => {
          const data = doc.data();

          // ⛔ Zaman olmayan (serverTimestamp bekleyen) mesajlar listeye alınmasın
          if (!data.time) return;

          list.push({
            id: doc.id,
            ...data,
          });
        });

        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.error("🔥 useMessages error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [roomId]);

  return { messages, loading };
}
