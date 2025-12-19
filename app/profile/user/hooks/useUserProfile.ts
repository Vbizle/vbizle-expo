import { db } from "@/firebase/firebaseConfig";
import { getLevelInfo } from "@/src/utils/levelSystem";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export type UserProfileData = {
  uid: string;

  // temel
  username: string;
  avatar?: string;
  vbId?: string;

  // kapaklar
  gallery: string[];

  // profil bilgileri
  gender?: string;
  age?: string | number;
  nationality?: any;

  // vip / level
  vipScore: number;
  vbTotalSent: number;
  levelInfo: ReturnType<typeof getLevelInfo>;

  // 🔒 ESKİ (dokunulmadı – bayi paneli vs için)
  isDealer: boolean;

  // ⭐ YENİ – ROZETLERİN TEK KAYNAĞI
  roles?: {
    root?: boolean;
    dealer?: boolean;
    svip?: boolean;
  };
};

export function useUserProfile(uid?: string) {
  const [data, setData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          if (!cancelled) setData(null);
          return;
        }

        const d: any = snap.data();

        // ⭐ LV hesaplama (kendi profil ile birebir)
        const vbTotalSent = d.vbTotalSent ?? 0;
        const levelInfo = getLevelInfo(vbTotalSent);

        if (!cancelled) {
          setData({
            uid,

            username: d.username || "",
            avatar: d.avatar || "",
            vbId: d.vbId || "",

            gallery: d.galleryPhotos || [],

            gender: d.gender || "",
            age: d.age || "",
            nationality: d.nationality || null,

            vipScore: d.vipScore ?? 0,
            vbTotalSent,

            levelInfo,

            // 🔒 ESKİ
            isDealer: d.isDealer === true || (d.dealerWallet ?? 0) > 0,

            // ✅ YENİ – OTOMATİK ROZETLER
            roles: d.roles || {},
          });
        }
      } catch (e) {
        console.log("❌ useUserProfile error", e);
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  return { data, loading };
}
