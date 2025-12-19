import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { collectionGroup, onSnapshot } from "firebase/firestore";

export function useDmUnreadCount() {
  const [dmUnread, setDmUnread] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = collectionGroup(db, "meta");

    const unsub = onSnapshot(q, (snap) => {
      let total = 0;

      snap.forEach((d) => {
        const data = d.data();
        const refPath = d.ref.path;

        // ❌ sistem mesajlarını sayma
        if (refPath.includes("/system")) return;
        if (data?.type === "system") return;

        if (data?.unread?.[user.uid]) {
          total += data.unread[user.uid];
        }
      });

      setDmUnread(total);
    });

    return () => unsub();
  }, []);

  return dmUnread;
}
