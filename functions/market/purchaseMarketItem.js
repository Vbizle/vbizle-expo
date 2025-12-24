// functions/market/purchaseMarketItem.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {
  MARKET_COLLECTIONS,
  INVENTORY_COLLECTIONS,
  assertValidItemType,
} = require("./marketSchemas");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * Callable: purchaseMarketItem
 * data: { itemType: "frame" | "svga", itemId: string }
 */
exports.purchaseMarketItem = onCall(
  { region: "us-central1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "LOGIN_REQUIRED");

    const itemType = String(request.data?.itemType || "");
    const itemId = String(request.data?.itemId || "");

    if (!itemId) throw new HttpsError("invalid-argument", "ITEM_ID_REQUIRED");

    try {
      assertValidItemType(itemType);
    } catch (e) {
      throw new HttpsError("invalid-argument", "INVALID_ITEM_TYPE");
    }

    const marketCol = MARKET_COLLECTIONS[itemType];
    const invCol = INVENTORY_COLLECTIONS[itemType];

    const userRef = db.collection("users").doc(uid);
    const itemRef = db.collection(marketCol).doc(itemId);

    // Inventory: users/{uid}/{invCol}/{itemId} (subcollection)
    const invRef = userRef.collection(invCol).doc(itemId);

    const now = admin.firestore.Timestamp.now();

    const result = await db.runTransaction(async (tx) => {
      const [userSnap, itemSnap, invSnap] = await Promise.all([
        tx.get(userRef),
        tx.get(itemRef),
        tx.get(invRef),
      ]);

      if (!userSnap.exists) {
        throw new HttpsError("not-found", "USER_NOT_FOUND");
      }
      if (!itemSnap.exists) {
        throw new HttpsError("not-found", "ITEM_NOT_FOUND");
      }

      const user = userSnap.data() || {};
      const item = itemSnap.data() || {};

      if (item.active !== true) {
        throw new HttpsError("failed-precondition", "ITEM_DISABLED");
      }

      const priceVb = Number(item.priceVb ?? item.priceVB ?? item.price ?? 0);
      const durationDays = Number(item.durationDays ?? 0);
      const stackable = item.stackable !== false;

      if (!Number.isFinite(priceVb) || priceVb <= 0) {
        throw new HttpsError("failed-precondition", "INVALID_PRICE");
      }
      if (!Number.isFinite(durationDays) || durationDays <= 0) {
        throw new HttpsError("failed-precondition", "INVALID_DURATION");
      }

      const vbBalance = Number(user.vbBalance ?? user.vb ?? 0);
      if (!Number.isFinite(vbBalance) || vbBalance < priceVb) {
        throw new HttpsError("failed-precondition", "INSUFFICIENT_VB");
      }

      // Süre hesaplama
      let newExpiresAt;
      let newTotalDays = durationDays;
      let newPurchasedCount = 1;

      if (invSnap.exists && stackable) {
        const inv = invSnap.data() || {};
        const prevExpiresAt = inv.expiresAt;

        newPurchasedCount = Number(inv.purchasedCount ?? 1) + 1;
        newTotalDays = Number(inv.totalDays ?? durationDays) + durationDays;

        // Eğer expire gelecekteyse üstüne ekle, bittiyse şimdi + duration
        if (prevExpiresAt && prevExpiresAt.toMillis && prevExpiresAt.toMillis() > now.toMillis()) {
          const ms = prevExpiresAt.toMillis() + durationDays * 24 * 60 * 60 * 1000;
          newExpiresAt = admin.firestore.Timestamp.fromMillis(ms);
        } else {
          const ms = now.toMillis() + durationDays * 24 * 60 * 60 * 1000;
          newExpiresAt = admin.firestore.Timestamp.fromMillis(ms);
        }
      } else {
        const ms = now.toMillis() + durationDays * 24 * 60 * 60 * 1000;
        newExpiresAt = admin.firestore.Timestamp.fromMillis(ms);
      }

      // Inventory yaz (merge)
      tx.set(
        invRef,
        {
          itemType,
          itemId,
          title: item.title || item.name || null,
          imageUrl: item.imageUrl || item.frameUrl || item.previewUrl || null,
          priceVb,
          durationDays,
          stackable,
          expiresAt: newExpiresAt,
          totalDays: newTotalDays,
          purchasedCount: newPurchasedCount,
          isEquipped: invSnap.exists ? (invSnap.data()?.isEquipped ?? false) : false,
          updatedAt: now,
          createdAt: invSnap.exists ? (invSnap.data()?.createdAt ?? now) : now,
        },
        { merge: true }
      );

      // VB düş
      tx.update(userRef, {
        vbBalance: admin.firestore.FieldValue.increment(-priceVb),
      });

      // Opsiyonel log (minimal)
      const logRef = db.collection("transactions").doc();
      tx.set(logRef, {
        type: "market_purchase",
        uid,
        itemType,
        itemId,
        priceVb,
        durationDays,
        createdAt: now,
      });

      return {
        ok: true,
        itemType,
        itemId,
        priceVb,
        durationDays,
        expiresAt: newExpiresAt.toDate().toISOString(),
        totalDays: newTotalDays,
        purchasedCount: newPurchasedCount,
      };
    });

    return result;
  }
);
