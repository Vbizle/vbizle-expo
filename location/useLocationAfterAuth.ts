import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { startLocationTracking } from "./locationService";

export function useLocationAfterAuth() {
  useEffect(() => {
    console.log("👀 useLocationAfterAuth mounted");

    const unsub = onAuthStateChanged(auth, (user) => {
      console.log("🔑 auth state changed:", user?.uid);

      if (user) {
        startLocationTracking();
      }
    });

    return () => unsub();
  }, []);
}
