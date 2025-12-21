import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

type UserBadgesData = {
  vbTotalSent?: number;   // 🔥 LEVEL İÇİN TEK GERÇEK KAYNAK
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
    admin?: boolean;
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
        

        // 🔍 DEBUG
        console.log("🔥 realtime badges", {
          uid,
          vbTotalSent: d.vbTotalSent,
          vipScore: d.vipScore,
          svp: d.svp,
          roles: d.roles,
        });

        setBadges({
          // 🔥 LEVEL ARTIK BURADAN OKUNUR
          vbTotalSent: d.vbTotalSent ?? 0,

          // VIP
          vipScore: d.vipScore ?? 0,

          // SVP
          svp: d.svp ?? undefined,

          // Roller
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
