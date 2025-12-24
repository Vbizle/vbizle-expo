import { auth, db } from "@/firebase/firebaseConfig";
import { calculateDistanceKm } from "@/location/distance";
import { resolveDisplayProfile } from "@/src/premium/resolveDisplayProfile";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

const normalizeGender = (g?: string) => {
  if (!g) return null;
  const val = g.toLowerCase();
  if (val === "male" || val === "erkek" || val === "e") return "male";
  if (val === "female" || val === "kadın" || val === "k") return "female";
  return null;
};

export function useNearbyOnlineUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  // 🔑 AUTH READY
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


        // 🔴 BENİM ZORUNLU ŞARTLARIM
        if (
          !myData.location ||
          !myData.location.enabled ||
          myData.location.lat == null ||
          myData.location.lng == null
        ) {
          return;
        }

        const myGender = normalizeGender(myData.gender);
const targetGender =
  !isMeRoot && myGender
    ? myGender === "male"
      ? "female"
      : "male"
    : null;

if (!isMeRoot && !myGender) return;

        const list: any[] = [];

        snap.docs.forEach((doc) => {
          if (doc.id === uid) return;

          const d = doc.data();
           // 🚫 ROOT → ASLA GÖSTERME
  if (!isMeRoot && d.role === "root") return;

          // 🕶️ AKTİF GİZLİ KULLANICI → LİSTE DIŞI (AYNI)
          const displayProfile = resolveDisplayProfile({
            username: d.username,
            avatarUrl: d.avatar,
            premiumStatus: d.premiumStatus,
          });
          if (displayProfile.isMasked) return;

          // 🔴 KARŞI TARAF KONUM ŞARTI
          if (
            !d.location ||
            !d.location.enabled ||
            d.location.lat == null ||
            d.location.lng == null
          ) {
            return;
          }

          if (!isMeRoot) {
  const otherGender = normalizeGender(d.gender);
  if (otherGender !== targetGender) return;
}

          const km = calculateDistanceKm(
            myData.location.lat,
            myData.location.lng,
            d.location.lat,
            d.location.lng
          );
          if (!Number.isFinite(km) || km > 50) return;

          // ⭐ PASİF SÜPER KULLANICI MI?
          const isSuperUserPurchased =
            Boolean(d.premiumStatus?.maskProfile) &&
            d.premiumStatus?.isActive === false;

          // 🕒 SON AKTİF (fallback’li)
          const lastActiveAt =
            d.lastActiveAt ||
            d.lastSeenAt ||
            d.updatedAt ||
            d.location?.updatedAt ||
            0;

          list.push({
            uid: doc.id,
            username: d.username,
            avatar: d.avatar,
            age: d.age,
            gender: d.gender,
            country: d.country,
            premiumStatus: d.premiumStatus,
            activeFrame: d.activeFrame || null,
            distanceKm: km,

            isSuperUserPurchased,
            lastActiveAt,
          });
        });

        // ⭐ SIRALAMA MANTIĞI
        const superUsers = list
  .filter((u) => u.isSuperUserPurchased)
  .sort((a, b) => a.distanceKm - b.distanceKm);

const normalUsers = list
  .filter((u) => !u.isSuperUserPurchased)
  .sort((a, b) => a.distanceKm - b.distanceKm);

        // 🔢 LİMİT: 30
        setUsers([...superUsers, ...normalUsers].slice(0, 30));
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return users;
}
