// src/premium/premiumService.ts

import { db } from "@/firebase/firebaseConfig";
import type { MarketItem, UserPremiumStatus } from "@/src/market/types";
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

/**
 * Kullanıcının premiumStatus alanını getirir
 */
export async function getUserPremiumStatus(
  uid: string
): Promise<UserPremiumStatus | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return (snap.data()?.premiumStatus as UserPremiumStatus) ?? null;
}

/**
 * Premium statüyü aktif / pasif yapar
 */
export async function setPremiumActive(uid: string, isActive: boolean) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    "premiumStatus.isActive": isActive,
  });
}

/**
 * Listelerde kimlik gizleme aç / kapat
 */
export async function setPremiumHideIdentity(uid: string, hide: boolean) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    "premiumStatus.hideRealIdentity": hide,
  });
}

/**
 * Premium statüyü tamamen temizler (süre bitince)
 */
export async function clearPremiumStatus(uid: string) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    premiumStatus: null,
  });
}

/**
 * Market üzerinden statü satın alma
 * - VB düşer
 * - premiumStatus oluşturur
 * - Mevcut premium varsa süresini uzatır
 */
export async function purchaseStatus(uid: string, item: MarketItem) {
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) {
      throw new Error("Kullanıcı bulunamadı");
    }

    const user: any = snap.data();
    const vbBalance = user.vbBalance ?? 0;

    if (vbBalance < item.priceVb) {
      throw new Error("Yetersiz VB");
    }

    const now = Timestamp.now();

    // Mevcut premium varsa süresini uzat
    let expiresAt: Timestamp;
    if (
      user.premiumStatus?.expiresAt &&
      typeof user.premiumStatus.expiresAt?.toMillis === "function" &&
      user.premiumStatus.expiresAt.toMillis() > now.toMillis()
    ) {
      expiresAt = Timestamp.fromMillis(
        user.premiumStatus.expiresAt.toMillis() +
          item.durationDays * 24 * 60 * 60 * 1000
      );
    } else {
      expiresAt = Timestamp.fromMillis(
        now.toMillis() + item.durationDays * 24 * 60 * 60 * 1000
      );
    }

    tx.update(userRef, {
      vbBalance: vbBalance - item.priceVb,
      premiumStatus: {
        type: item.id,
        isActive: true,
        hideRealIdentity: true,
        expiresAt,
        maskProfile: item.maskProfile,
        purchasedAt: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  });
}
