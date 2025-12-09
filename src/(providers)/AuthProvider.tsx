import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { AppState } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebaseConfig";

import {
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  collectionGroup,
  getDoc,
  runTransaction,
  setDoc,
} from "firebase/firestore";

import { useVbWallet } from "../../src/(hooks)/useVbWallet";
import { useUi } from "./UiProvider";

// ==========================================================
// VB-ID (SIRALI ID: VB-1, VB-2, VB-3 ...)
// ==========================================================
async function ensureSequentialVbId(uid: string) {
  const userRef = doc(db, "users", uid);
  const counterRef = doc(db, "_counters", "vbUserCounter");

  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().vbId) return;

  await runTransaction(db, async (transaction) => {
    let counterSnap = await transaction.get(counterRef);

    if (!counterSnap.exists()) {
      transaction.set(counterRef, { last: 0 });
      counterSnap = {
        exists: () => true,
        data: () => ({ last: 0 }),
      } as any;
    }

    const last = counterSnap.data().last ?? 0;
    const next = last + 1;

    transaction.update(counterRef, { last: next });

    const vbId = `VB-${next}`;
    transaction.update(userRef, { vbId });
  });
}

// ==========================================================
//                 AUTH PROVIDER
// ==========================================================
export default function AuthProvider({ children }: any) {
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const ui = useUi();
  const activeDM = ui?.activeDM;
  const showToast = ui?.showToast;

  const lastUnreadRef = useRef<Record<string, number>>({});

  // ========================================================
  // LOGIN / LOGOUT
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

      await ensureSequentialVbId(u.uid);

      const snap = await getDoc(userRef);
      const data = snap.data() || {};

      const avatar =
        data.avatar && data.avatar !== "" ? data.avatar : "/user.png";

      setMe({
        uid: u.uid,
        name: data.username,
        avatar,
        vbId: data.vbId,
      });

      // Kullanıcı giriş yapınca → online: true & lastSeen güncel
      await updateDoc(userRef, {
        online: true,
        lastSeen: serverTimestamp(), // ⭐ EKLENDİ
      });

      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  // ========================================================
  // USER PRESENCE (MOBİL)
  // ========================================================
  useEffect(() => {
    if (!firebaseUser) return;

    const userRef = doc(db, "users", firebaseUser.uid);

    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        // Uygulama ön plana geçmiş → online
        await updateDoc(userRef, { online: true });
      } else {
        // Arka plan veya kapanma → offline + lastSeen güncelle
        await updateDoc(userRef, {
          online: false,
          lastSeen: serverTimestamp(), // ⭐ EKLENDİ
        });
      }
    });

    return () => sub.remove();
  }, [firebaseUser]);

  // ========================================================
  // VB CÜZDAN HOOK
  // ========================================================
  useVbWallet(firebaseUser);

  // ========================================================
  // GLOBAL MESAJ TOAST BİLDİRİMLERİ
  // ========================================================
  useEffect(() => {
    if (!me) return;
    if (!showToast) return;

    const unsub = onSnapshot(collectionGroup(db, "meta"), async (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type !== "modified") continue;

        const metaDoc = change.doc;
        const data = metaDoc.data();

        const convDoc = metaDoc.ref.parent.parent;
        const topCollection = convDoc?.parent;

        if (!convDoc || !topCollection || topCollection.id !== "dm") continue;

        const convId = convDoc.id;
        const [a, b] = convId.split("_");
        const myId = me.uid;
        const otherId = a === myId ? b : b === myId ? a : null;

        if (!otherId) continue;

        const unread = data?.unread?.[myId] ?? 0;
        const lastSender = data?.lastSender;

        if (unread <= 0) continue;
        if (lastSender === myId) continue;

        const prevUnread = lastUnreadRef.current[convId] ?? 0;
        if (unread === prevUnread) continue;

        lastUnreadRef.current[convId] = unread;

        if (activeDM && String(activeDM) === String(otherId)) continue;

        const userSnap = await getDoc(doc(db, "users", otherId));
        const senderName = userSnap.exists()
          ? userSnap.data().username || "Kullanıcı"
          : "Kullanıcı";

        showToast(`${senderName} sana mesaj gönderdi.`);
      }
    });

    return () => unsub();
  }, [me, activeDM, showToast]);

  if (!loaded) return null;

  return children;
}
