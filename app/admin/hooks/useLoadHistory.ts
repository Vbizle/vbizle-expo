import { db } from "@/firebase/firebaseConfig";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    where,
} from "firebase/firestore";
import { useCallback, useState } from "react";

type HistoryTab = "vb" | "dealer";

export default function useLoadHistory({
  fallbackAvatar,
  historyTab,
}: {
  fallbackAvatar: string;
  historyTab: HistoryTab;
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(
    async (vbId: string) => {
      try {
        setHistoryLoading(true);

        const q = query(
          collection(db, "loadHistory"),
          where("toVbId", "==", vbId),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snap = await getDocs(q);

        const filtered = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((h: any) =>
            historyTab === "dealer"
              ? h.source === "root_dealer"
              : h.source === "root" || h.source === "dealer"
          );

        const enriched = await Promise.all(
          filtered.map(async (h: any) => {
            let toUser = {
              username: h.toVbId,
              avatar: fallbackAvatar,
            };

            if (h.toUid) {
              const us = await getDoc(doc(db, "users", h.toUid));
              if (us.exists()) {
                const u = us.data();
                toUser = {
                  username: u.username ?? h.toVbId,
                  avatar: u.avatar ?? fallbackAvatar,
                };
              }
            }

            return { ...h, toUser };
          })
        );

        setHistory(enriched);
      } catch {
        setHistory([]);
      }

      setHistoryLoading(false);
    },
    [fallbackAvatar, historyTab]
  );

  const resetHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    historyLoading,
    loadHistory,
    resetHistory,
  };
}