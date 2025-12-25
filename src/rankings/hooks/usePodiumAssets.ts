import { db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

type PodiumAssets = {
  top1?: string;
  top2?: string;
  top3?: string;
};

export function usePodiumAssets() {
  const [assets, setAssets] = useState<PodiumAssets>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "ui_assets", "podium");

    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAssets({
          top1: data?.top1?.image,
          top2: data?.top2?.image,
          top3: data?.top3?.image,
        });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { assets, loading };
}
