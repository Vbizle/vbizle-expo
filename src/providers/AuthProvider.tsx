import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Alert, AppState } from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

import {
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { useVbWallet } from "../../src/(hooks)/useVbWallet";

// ==========================================================
//    VB-ID OLUŞTURMA (AYNEN KORUNDU)
// ==========================================================
async function ensureSequentialVbId(uid: string) {
  const userRef = doc(db, "users", uid);
  const counterRef = doc(db, "_counters", "vbUserCounter");

  const userSnap = await getDoc(userRef);
  if (userSnap.exists() && userSnap.data().vbId) return;

  await runTransaction(db, async (tx) => {
    let counterSnap = await tx.get(counterRef);

    if (!counterSnap.exists()) {
      tx.set(counterRef, { last: 0 });
      counterSnap = { exists: () => true, data: () => ({ last: 0 }) };
    }

    const last = counterSnap.data().last ?? 0;
    const next = last + 1;

    tx.update(counterRef, { last: next });

    const vbId = `VB-${next}`;
    tx.update(userRef, { vbId });
  });
}

// ==========================================================
//                    AUTH PROVIDER (DÜZELTİLMİŞ)
// ==========================================================
export default function AuthProvider({ children }: any) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  // --------------------------------------------------------
  //  Giriş / Çıkış Dinleme
  // --------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);

      if (!u) {
        setMe(null);
        setLoaded(true);
        return;
      }

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        setMe(null);
        setLoaded(true);
        return;
      }

      await ensureSequentialVbId(u.uid);

      const data = snap.data() || {};

      setMe({
        uid: u.uid,
        name: data.username,
        avatar: data.avatar ?? "",
        vbId: data.vbId,
        gender: data.gender,
        birthDate: data.birthDate,
      });

      await updateDoc(userRef, { online: true });

      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------
  // Online / Offline durumu
  // --------------------------------------------------------
  useEffect(() => {
    if (!firebaseUser) return;

    const userRef = doc(db, "users", firebaseUser.uid);

    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        await updateDoc(userRef, { online: true });
      } else {
        await updateDoc(userRef, {
          online: false,
          lastSeen: serverTimestamp(),
        });
      }
    });

    return () => sub.remove();
  }, [firebaseUser]);

  // --------------------------------------------------------
  // VB Cüzdan (AYNEN KORUNDU)
  // --------------------------------------------------------
  useVbWallet(firebaseUser);

  // --------------------------------------------------------
  // DM Bildirimleri + HIDDEN FIX (YENİ EKLENDİ)
  // --------------------------------------------------------
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

        // ======================================================
        // ⭐ YENİ EKLENEN KRİTİK DÜZELTME (Hidden → False)
        // ======================================================
        if (data.hidden === true && unread > 0 && lastSender !== me.uid) {
          await updateDoc(change.doc.ref, { hidden: false });
        }
        // ======================================================

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

  // --------------------------------------------------------
  // Yükleme bitmeden UI açılmasın
  // --------------------------------------------------------
  if (!loaded) return null;

  return children;
}
