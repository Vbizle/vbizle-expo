import { db } from "@/firebase/firebaseConfig";
import {
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDocs,
    setDoc,
    updateDoc,
} from "firebase/firestore";

/* ============================================================
   📌 1) BAŞA SABİTLE — Kullanıcıya özel pin kaydı tutar
=============================================================== */
export async function pinConversation(myUid: string, conv: any) {
  try {
    const ref = doc(db, "users", myUid, "dmPinned", conv.convId);

    await setDoc(ref, {
      convId: conv.convId,
      otherId: conv.otherId,
      time: Date.now(),
    });

    console.log("🔝 Başa sabitlenen DM:", conv.convId);
  } catch (err) {
    console.error("Pin error:", err);
  }
}

/* ============================================================
   📌 2) MESAJLAŞMAYI SİL — DM mesajlarını tamamen temizler
=============================================================== */
export async function deleteConversation(myUid: string, conv: any) {
  try {
    const convRef = collection(db, "dm", conv.convId, "messages");
    const snap = await getDocs(convRef);

    // DM altındaki tüm mesajları sil
    for (let d of snap.docs) {
      await deleteDoc(d.ref);
    }

    // meta/info belgesini sil
    await deleteDoc(doc(db, "dm", conv.convId, "meta", "info"));

    console.log("🗑️ DM silindi:", conv.convId);
  } catch (err) {
    console.error("DM delete error:", err);
  }
}

/* ============================================================
   📌 3) ENGELLE — Kullanıcıyı blockedUsers listesine ekler
=============================================================== */
export async function blockUser(myUid: string, otherUid: string) {
  try {
    const userRef = doc(db, "users", myUid);

    await updateDoc(userRef, {
      blockedUsers: arrayUnion(otherUid),
    });

    console.log("⛔ Kullanıcı engellendi:", otherUid);
  } catch (err) {
    console.error("Block error:", err);
  }
}
