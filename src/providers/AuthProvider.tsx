import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

import {
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc
} from "firebase/firestore";

import { useVbWallet } from "../../src/(hooks)/useVbWallet";


// ==========================================================
// VB-ID (SIRALI ID: VB-1, VB-2, VB-3 ...)
//
// EXPO SÜRÜMÜ → tamamen aynı çalışıyor
// ==========================================================
async function ensureSequentialVbId(uid: string) {
  const userRef = doc(db, "users", uid);
  const counterRef = doc(db, "_counters", "vbUserCounter");

  const userSnap = await getDoc(userRef);

  // Eğer kullanıcı zaten vbId aldıysa çık
  if (userSnap.exists() && userSnap.data().vbId) return;

  await runTransaction(db, async (transaction) => {
    let counterSnap = await transaction.get(counterRef);

    if (!counterSnap.exists()) {
      transaction.set(counterRef, { last: 0 });
      counterSnap = {
        exists: () => true,
        data: () => ({ last: 0 }),
      };
    }

    const last = counterSnap.data().last ?? 0;
    const next = last + 1;

    transaction.update(counterRef, { last: next });

    const vbId = `VB-${next}`;
    transaction.update(userRef, { vbId });
  });
}


// ==========================================================
//                 AUTH PROVIDER (EXPO VERSION)
// ==========================================================
export default function AuthProvider({ children }: any) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // ========================================================
  //  LOGIN / LOGOUT
  // ========================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);

      if (!u) {
        setMe(null);
        setLoaded(true);
        return;
      }

      const userRef = doc(db, "users", u.uid);

      // 1) VB-ID oluştur
      await ensureSequentialVbId(u.uid);

      // 2) Kullanıcı verisini çek
      const snap = await getDoc(userRef);
      const data = snap.data() || {};

      const avatar =
        data.avatar && data.avatar !== "" ? data.avatar : "";

      setMe({
        uid: u.uid,
        name: data.username,
        avatar,
        vbId: data.vbId,
      });

      // 3) Kullanıcı online yap
      await updateDoc(userRef, { online: true });

      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // ========================================================
  //  USER PRESENCE (MOBİL SÜRÜM)
  //
  //  AppState ile çalışır:
  //  aktif → online: true
  //  arka plan → online: false + lastSeen
  // ========================================================
  

  // ========================================================
  // 2) VB CÜZDAN HOOK
  // ========================================================
  useVbWallet(firebaseUser);

  // ========================================================
  // 3) GLOBAL MESAJ BİLDİRİMLERİ → React Native Alert
  // ========================================================
  useEffect(() => {
    if (!me) return;

    const unsub = onSnapshot(collectionGroup(db, "meta"), async (snap) => {
      snap.docChanges().forEach(async (change) => {
        if (change.type !== "modified") return;

        const data = change.doc.data();
        const convId = change.doc.ref.parent.parent?.id;
        if (!convId) return;

        const [a, b] = convId.split("_");
        const otherId = a === me.uid ? b : b === me.uid ? a : null;

        if (!otherId) return;

        const unread = data?.unread?.[me.uid] ?? 0;
        const lastSender = data?.lastSender;

        if (unread > 0 && lastSender !== me.uid) {
          const userSnap = await getDoc(doc(db, "users", otherId));
          const sender =
            userSnap.exists() ? userSnap.data().username : "Kullanıcı";

          Alert.alert("Yeni Mesaj", `${sender} sana mesaj gönderdi`);
        }
      });
    });

    return () => unsub();
  }, [me]);

  if (!loaded) return null;

  return children;
}
