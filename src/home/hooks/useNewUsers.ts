import { auth, db } from "@/firebase/firebaseConfig";
import { calculateDistanceKm } from "@/location/distance"; // ✅ YENİ
import { resolveDisplayProfile } from "@/src/premium/resolveDisplayProfile";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export function useNewUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  // 🔑 AUTH READY (sadece mesafe için gerekli)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(50)
      ),
      (snap) => {
        let myLocation: any = null;

        // 🔹 BENİM KONUMUM (varsa)
        const myDoc = snap.docs.find((d) => d.id === uid);
        if (myDoc) {
          const myData = myDoc.data();
          if (
            myData.location &&
            myData.location.enabled &&
            myData.location.lat != null &&
            myData.location.lng != null
          ) {
            myLocation = myData.location;
          }
        }

        const list: any[] = [];

        snap.docs.forEach((doc) => {
          if (doc.id === uid) return;

          const d = doc.data();

          // 🚫 ROOT KULLANICI → ASLA GÖSTERME
          if (d.role === "root") return;

          // 🕶️ Aktif gizli kullanıcı → listede YOK
          const displayProfile = resolveDisplayProfile({
            username: d.username,
            avatarUrl: d.avatar,
            premiumStatus: d.premiumStatus,
          });
          if (displayProfile.isMasked) return;

          // ✅ MESAFE HESABI (opsiyonel)
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
            createdAt: d.createdAt || 0, // 🔴 KRİTİK
            distanceKm, // ✅ EKLENDİ
             online: d.online === true,
          });
        });
          list.sort((a, b) => b.createdAt - a.createdAt);


        setUsers(list);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  return users;
}
