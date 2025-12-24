import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

/**
 * ✅ Avatar frame aktif et
 * Aynı anda SADECE 1 frame aktif olur
 * Ayrıca profile (users/{uid}) içine activeFrame yazar:
 *   activeFrame: { frameId, imageUrl, updatedAt }
 */
export async function setFrameActive(frameId: string, active: boolean) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const colRef = collection(db, "users", uid, "inventory_frames");

  // 1) Hepsini kapat
  const snap = await getDocs(colRef);
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { isActive: false })));

  // 2) Profil activeFrame'i temizle (kapatınca çerçeve kalsın istemiyorsun)
  if (!active) {
    await updateDoc(doc(db, "users", uid), {
      activeFrame: null,
    });
    return;
  }

  // 3) Seçileni aktif et
  const invRef = doc(db, "users", uid, "inventory_frames", frameId);
  await updateDoc(invRef, { isActive: true });

  // 4) imageUrl çöz: önce inventory'den, yoksa market'ten
  const invSnap = await getDoc(invRef);
  const invData: any = invSnap.exists() ? invSnap.data() : null;

  const itemId = invData?.itemId ?? frameId;

  // inventory içinde varsa kullan
  let resolvedUrl: string | null =
    typeof invData?.imageUrl === "string" && invData.imageUrl
      ? invData.imageUrl
      : null;

  // inventory'de yoksa market'ten çek
  if (!resolvedUrl) {
    const marketRef = doc(db, "market_items_frames", itemId);
    const marketSnap = await getDoc(marketRef);

    if (marketSnap.exists()) {
      const m: any = marketSnap.data();

      // ✅ Sende bazen imageUrl değil frameImageUrl var
      resolvedUrl =
        (typeof m?.imageUrl === "string" && m.imageUrl) ||
        (typeof m?.frameImageUrl === "string" && m.frameImageUrl) ||
        null;
    }
  }

  // 5) Hala yoksa: profile'a yazma (undefined yazdırınca satın alma da patlıyordu)
  if (!resolvedUrl) {
    console.error("❌ frameImageUrl yok, activeFrame yazılmadı", {
      frameId,
      itemId,
      invData,
    });
    return;
  }

  // 6) Profile'a yaz
  await updateDoc(doc(db, "users", uid), {
    activeFrame: {
      frameId,
      imageUrl: resolvedUrl,
      updatedAt: Date.now(),
    },
  });
}

/**
 * 👁️ Listelerde gizle / göster
 */
export async function setFrameHideInLists(frameId: string, hide: boolean) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const ref = doc(db, "users", uid, "inventory_frames", frameId);
  await updateDoc(ref, {
    hideInLists: hide,
  });
}
