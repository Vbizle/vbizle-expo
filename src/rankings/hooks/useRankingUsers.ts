import { db } from "@/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

export function useRankingUsers(uids: string[]) {
  const [users, setUsers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (uids.length === 0) return;

    const fetchUsers = async () => {
      const q = query(
        collection(db, "users"),
        where("__name__", "in", uids.slice(0, 10))
      );

      const snap = await getDocs(q);
      const map: Record<string, any> = {};

      snap.forEach((doc) => {
        map[doc.id] = doc.data();
      });

      setUsers(map);
    };

    fetchUsers();
  }, [uids.join(",")]);

  return users;
}
