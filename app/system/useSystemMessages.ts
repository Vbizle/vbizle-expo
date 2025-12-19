import { auth, db } from "@/firebase/firebaseConfig";
import {
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    where,
    writeBatch,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useSystemMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "appMessages"),
      where("toUid", "in", [uid, "ALL"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      let unread = 0;

      snap.forEach((d) => {
        const data = d.data();
        if (!data.read) unread++;
        arr.push({ id: d.id, ...data });
      });

      setMessages(arr);
      setUnreadCount(unread);
    });

    return () => unsub();
  }, []);

  // 🔴 TÜM SİSTEM MESAJLARINI OKUNDU İŞARETLE
  const markAllAsRead = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "appMessages"),
      where("toUid", "in", [uid, "ALL"]),
      where("read", "==", false)
    );

    const snap = await new Promise<any>((res) =>
      onSnapshot(q, (s) => res(s), { once: true })
    );

    const batch = writeBatch(db);
    snap.forEach((d: any) => {
      batch.update(doc(db, "appMessages", d.id), { read: true });
    });

    await batch.commit();
  };

  return { messages, unreadCount, markAllAsRead };
}
