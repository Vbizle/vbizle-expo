import { auth, db } from "@/firebase/firebaseConfig";
import { calculateDistanceKm } from "@/location/distance"; // ✅ YENİ
import { resolveDisplayProfile } from "@/src/premium/resolveDisplayProfile";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const normalizeGender = (g?: string) => {
  if (!g) return null;
  const v = g.toLowerCase();
  if (v === "male" || v === "erkek" || v === "e") return "male";
  if (v === "female" || v === "kadın" || v === "k") return "female";
  return null;
};

export function useDiscoverOnlineUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      query(collection(db, "users"), where("online", "==", true)),
      (snap) => {
        const myDoc = snap.docs.find((d) => d.id === uid);
        if (!myDoc) return;

        const myData = myDoc.data();
        const isMeRoot = myData.role === "root";

        const myGender = normalizeGender(myData.gender);
        const targetGender =
          !isMeRoot && myGender
            ? myGender === "male"
              ? "female"
              : "male"
            : null;

        // ✅ BENİM KONUMUM (varsa)
        const myLocation =
          myData.location &&
          myData.location.enabled &&
          myData.location.lat != null &&
          myData.location.lng != null
            ? myData.location
            : null;

        const list: any[] = [];

        snap.docs.forEach((doc) => {
          if (doc.id === uid) return;

          const d = doc.data();

          // 🚫 ROOT → normal kullanıcılar root'u görmez
          if (!isMeRoot && d.role === "root") return;

          // 🕶️ AKTİF GİZLİ KULLANICI → HERKES İÇİN GİZLİ
          const displayProfile = resolveDisplayProfile({
            username: d.username,
            avatarUrl: d.avatar,
            premiumStatus: d.premiumStatus,
          });
          if (displayProfile.isMasked) return;

          // 🔹 CİNSİYET FİLTRESİ (SADECE ROOT DEĞİLSE)
          if (!isMeRoot) {
            const g = normalizeGender(d.gender);
            if (g !== targetGender) return;
          }

          // ⭐ SÜPER KULLANICI (SATIN ALINMIŞ AMA AKTİF DEĞİL)
          const isSuperUserPurchased =
            Boolean(d.premiumStatus?.maskProfile) &&
            d.premiumStatus?.isActive === false;

          // 🕒 SON AKTİF ZAMANI (fallback’li)
          const lastActiveAt =
            d.lastActiveAt ||
            d.lastSeenAt ||
            d.updatedAt ||
            d.location?.updatedAt ||
            0;

          // ✅ MESAFE HESABI (filtre YOK, sadece gösterim)
          let distanceKm: number | null = null;

          if (
            myLocation &&
            d.location &&
            d.location.enabled &&
            d.location.lat != null &&
            d.location.lng != null
          ) {
            const km = calculateDistanceKm(
              myLocation.lat,
              myLocation.lng,
              d.location.lat,
              d.location.lng
            );
            if (Number.isFinite(km)) {
              distanceKm = km;
            }
          }

          list.push({
            uid: doc.id,
            username: d.username,
            avatar: d.avatar,
            age: d.age,
            gender: d.gender,
            country: d.country,
            premiumStatus: d.premiumStatus,
            activeFrame: d.activeFrame || null,

            isSuperUserPurchased,
            lastActiveAt,
            distanceKm, // ✅ EKLENDİ
          });
        });

        // ⭐ SIRALAMA MANTIĞI (AYNI)
        const superUsers = list
          .filter((u) => u.isSuperUserPurchased)
          .sort((a, b) => b.lastActiveAt - a.lastActiveAt);

        const normalUsers = list
          .filter((u) => !u.isSuperUserPurchased)
          .sort((a, b) => b.lastActiveAt - a.lastActiveAt);

        // 🔢 LİMİT: 30
        setUsers([...superUsers, ...normalUsers].slice(0, 30));
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return users;
}
