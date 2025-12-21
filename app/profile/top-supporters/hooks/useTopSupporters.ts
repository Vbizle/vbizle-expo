import { db } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { mapTopSupporterItem } from "./mapTopSupporterItem";



type Badges = {
  level: number;
  vip: number;
  svp: number;
  dealer: boolean;
  admin?: boolean;
  root?: boolean;
};
const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";


export type TopSupporterItem = {
  id: string;
  supporterUid: string;
  username?: string;
  avatar?: string | null;
  totalVb: number;
  badges?: Badges;

  // 👇 PROFİL BİLGİLERİ (AYNEN)
  age?: number;
  gender?: "male" | "female";
  country?: string; // 🔥 ARTIK FLAG EMOJİSİ TUTACAK
};

export function useTopSupporters(userUid: string) {
  const [list, setList] = useState<TopSupporterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   if (!userUid) {
  setList([]);
  setLoading(false);
  return;
}

    const q = query(
      collection(db, "users", userUid, "topSupporters"),
      orderBy("totalVb", "desc"),
      limit(25)
    );

   const unsub = onSnapshot(
  q,
  async (snap) => {
    const rows = await Promise.all(
      snap.docs
        .filter((d) => {
          const data: any = d.data();
          const supporterUid = data.supporterUid || d.id;

          // 🔒 ROOT KULLANICIYI TAMAMEN DIŞARIDA BIRAK
          return supporterUid !== PLATFORM_ROOT_UID;
        })
        .map(async (d) => {
          const data: any = d.data();
          const supporterUid = data.supporterUid || d.id;

          // 🔥 PROFİL DOKÜMANI (AYNEN KALDI)
          const userRef = doc(db, "users", supporterUid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          // ✅ SADECE RETURN DEĞİŞTİ
          return mapTopSupporterItem({
            id: d.id,
            supporterUid,
            data,
            userData,
          });
        })
    );

    setList(rows);
    setLoading(false);
  },
  (err) => {
    console.error(
      "TopSupporters snapshot error:",
      err.code || err.message
    );
    setLoading(false);
  }
);

    return unsub;
  }, [userUid]);

  return { list, loading };
}
