import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

type RankingItem = {
  uid: string;
  total: number;
};

type RankingDoc = {
  list: RankingItem[];
  updatedAt?: any;
};

export function useRanking(
  type: "supporters" | "broadcasters",
  period: "daily" | "weekly" | "monthly"
) {
  const [data, setData] = useState<RankingDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔒 Son geçerli veriyi tut (boş snapshot koruması)
  const lastDataRef = useRef<RankingDoc | null>(null);

  useEffect(() => {
    // 🔁 Sekme / type değişince loading tekrar true olsun
    setLoading(true);

    const ref = doc(db, "rankings", type, period, "current");

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const docData = snap.data() as RankingDoc;
          lastDataRef.current = docData;
          setData(docData);
        } else {
          // ⚠️ Doc geçici yoksa eski veriyi koru
          setData(lastDataRef.current);
        }
        setLoading(false);
      },
      (err) => {
        console.error("❌ ranking snapshot error", err);
        setData(lastDataRef.current);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [type, period]);

  return {
    data,
    loading,
  };
}
