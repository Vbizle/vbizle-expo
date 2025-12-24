import { auth, db } from "@/firebase/firebaseConfig";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect } from "react";

export function usePresence() {
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // 🔥 İlk açılışta online
    updateDoc(userRef, {
      online: true,
      lastSeen: serverTimestamp(),
    });

    // ❤️ HEARTBEAT — app açık olduğu sürece
    const interval = setInterval(() => {
      updateDoc(userRef, {
        lastSeen: serverTimestamp(),
      });
    }, 60 * 1000); // 1 dk

    return () => clearInterval(interval);
  }, []);
}
