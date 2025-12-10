import { db } from "@/firebase/firebaseConfig";
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    updateDoc,
    writeBatch,
} from "firebase/firestore";

/* ======================================================
   🔥 DM SİL — konuşmayı tamamen sil
====================================================== */
export async function deleteConversation(convId: string) {
  try {
    const msgsRef = collection(db, "dm", convId, "messages");
    const snap = await getDocs(msgsRef);
    const batch = writeBatch(db);

    snap.forEach((d) => batch.delete(d.ref));

    batch.delete(doc(db, "dm", convId, "meta", "info"));

    await batch.commit();
    return true;
  } catch (err) {
    console.log("DM silme hatası:", err);
    return false;
  }
}

/* ======================================================
   ⭐ DM SABİTLE — pinnedDMs alanına ekle
====================================================== */
export async function pinConversation(meId: string, convId: string) {
  try {
    await updateDoc(doc(db, "users", meId), {
      pinnedDMs: arrayUnion(convId),
    });
    return true;
  } catch (err) {
    console.log("Sabitlenme hatası:", err);
    return false;
  }
}

/* ======================================================
   ⛔ ENGELLE — blocked listesine ekle
====================================================== */
export async function blockUser(meId: string, otherId: string) {
  try {
    await updateDoc(doc(db, "users", meId), {
      blocked: arrayUnion(otherId),
    });
    return true;
  } catch (err) {
    console.log("Engelleme hatası:", err);
    return false;
  }
}
