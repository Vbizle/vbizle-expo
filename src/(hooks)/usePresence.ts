import { AppState } from "react-native";
import { useEffect, useRef } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export function usePresence() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const user = auth.currentUser;
      if (!user) return;

      if (nextState === "active") {
        // Uygulama aktif → kullanıcı online
        await updateDoc(doc(db, "users", user.uid), {
          online: true,
          lastSeen: serverTimestamp(),
        });
      } else {
        // App arka plana, kapandı veya swipe ile kapatıldı → offline
        await updateDoc(doc(db, "users", user.uid), {
          online: false,
          lastSeen: serverTimestamp(),
        });
      }

      appState.current = nextState;
    });

    return () => sub.remove();
  }, []);
}
