import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

type UserBadgesData = {
  level?: number;
  vipScore?: number;
  svp?: {
    level?: number;
    points?: number;
    lastEvaluatedMonth?: string;
  };
  roles?: {
    dealer?: boolean;
    root?: boolean;
    svip?: boolean;
  };
};

export function useRealtimeUserBadges(uid?: string) {
  const [badges, setBadges] = useState<UserBadgesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setBadges(null);
      setLoading(false);
      return;
    }

    const ref = doc(db, "users", uid);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setBadges(null);
          setLoading(false);
          return;
        }

        const d: any = snap.data();

        // 🔍 DEBUG — SVP DAHİL TAM GÖRÜNTÜ
        console.log("🔥 realtime badges", {
          uid,
          roles: d.roles,
          svp: d.svp,
        });

        setBadges({
          // 🔹 LV sistemi (mevcut yapı bozulmaz)
          level: d.level ?? undefined,

          // 🔹 VIP sistemi
          vipScore: d.vipScore ?? undefined,

          // 🟣 SVP SİSTEMİ (ASLINDA EKSİK OLAN)
          svp: d.svp ?? undefined,

          // 🔹 Roller
          roles: d.roles || {},
        });

        setLoading(false);
      },
      (err) => {
        console.log("❌ useRealtimeUserBadges error:", err);
        setBadges(null);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [uid]);

  return { badges, loading };
}
