import { auth, db } from "@/firebase/firebaseConfig";
import * as Location from "expo-location";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect } from "react";

export function useLocationAfterAuth() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      // 🛑 ZATEN KONUM AÇIKSA TEKRAR ÇALIŞMA
      if (snap.exists() && snap.data()?.location?.enabled) {
        return;
      }

      // 🟢 Ön plan izni
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") return;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await setDoc(
        ref,
        {
          location: {
            lat: current.coords.latitude,
            lng: current.coords.longitude,
            enabled: true,
            updatedAt: Date.now(),
          },
        },
        { merge: true }
      );
    });

    return () => unsub();
  }, []);
}
