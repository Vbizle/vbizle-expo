// app/admin/withdraw/useWithdrawList.ts
import { db } from "@/firebase/firebaseConfig";
import {
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    startAfter,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export type WithdrawStatus = "pending" | "approved" | "rejected";

export function useWithdrawList(status: WithdrawStatus) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  async function load(initial = false) {
    if (loading) return;
    setLoading(true);

    try {
      let q = query(
        collection(db, "withdrawRequests"),
        where("status", "==", status),
        orderBy("createdAt", "asc"),
        limit(25)
      );

      if (!initial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snap = await getDocs(q);

      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (initial) {
        setItems(docs);
      } else {
        setItems((prev) => [...prev, ...docs]);
      }

      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === 25);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // status değişince reset
    setItems([]);
    setLastDoc(null);
    setHasMore(true);
    load(true);
  }, [status]);

  return {
    items,
    loading,
    hasMore,
    loadMore: () => load(false),
    reload: () => load(true),
  };
}
