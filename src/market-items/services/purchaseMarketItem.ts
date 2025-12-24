import { auth, db, firebaseApp } from "@/firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import type { MarketItemType } from "../types";

type PurchaseMarketItemParams = {
  itemType: MarketItemType;
  itemId: string;
};

type PurchaseMarketItemResult = {
  ok: boolean;
  itemType: MarketItemType;
  itemId: string;
  priceVb: number;
  durationDays: number;
  expiresAt: string;
  totalDays: number;
  purchasedCount: number;
};

export async function purchaseMarketItem(
  params: PurchaseMarketItemParams
): Promise<PurchaseMarketItemResult> {
  const functions = getFunctions(firebaseApp);
  const fn = httpsCallable(functions, "purchaseMarketItem");

  try {
    const res = await fn(params);
    const data = res.data as PurchaseMarketItemResult;

    // 🖼️ FRAME SATIN ALINDIYSA → PROFİLE YAZ
    if (data.itemType === "frame") {
      const uid = auth.currentUser?.uid;
      if (uid) {
        const frameRef = doc(db, "market_items_frames", data.itemId);
        const frameSnap = await getDoc(frameRef);

        if (frameSnap.exists()) {
          const frameData = frameSnap.data();

          // 🔴 KRİTİK KONTROL
         if (!frameData.frameImageUrl) {
  console.error("❌ Frame frameImageUrl eksik:", data.itemId, frameData);
} else {
  await updateDoc(doc(db, "users", uid), {
    activeFrame: {
      frameId: data.itemId,
      imageUrl: frameData.frameImageUrl, // ✅ DOĞRU ALAN
      updatedAt: Date.now(),
              },
            });
          }
        }
      }
    }

    return data;
  } catch (err: any) {
    console.error("purchaseMarketItem error:", err);

    const code = err?.code;

    if (code === "functions/unauthenticated") {
      throw new Error("Lütfen giriş yapın");
    }

    if (code === "functions/failed-precondition") {
      throw new Error(err?.message || "İşlem gerçekleştirilemedi");
    }

    if (code === "functions/invalid-argument") {
      throw new Error("Geçersiz ürün");
    }

    throw new Error("Bir hata oluştu");
  }
}
