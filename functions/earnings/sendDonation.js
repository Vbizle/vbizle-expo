const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { requireAuth, parseBody } = require("../core/request");
const { db } = require("../core/helpers");

const { updateTopSupporter } = require("./topSupporters/updateTopSupporter");
// ✅ YENİ — VIP rank helper (dosya seviyesi, handler DIŞI)
function getVipRank(vipScore = 0) {
  const s = Number(vipScore) || 0;
  if (s >= 125001) return 5;
  if (s >= 75001) return 4;
  if (s >= 50001) return 3;
  if (s >= 20001) return 2;
  if (s >= 1000) return 1;
  return 0;
}

// ✅ YENİ — Level helper (vbTotalSent -> level) gerekiyorsa aynı yere koyulur
function getLevelRank(vbTotalSent = 0) {
  const t = Number(vbTotalSent) || 0;
  // örnek: kendi level aralıklarını buraya koyarsın
  if (t >= 100000) return 30;
  if (t >= 50000) return 20;
  if (t >= 10000) return 10;
  if (t >= 1000) return 1;
  return 0;
}
/**
 * A -> B BAĞIŞ
 * - A.vbBalance DÜŞER
 * - B.vbBalance DEĞİŞMEZ
 * - B.totalReceived + diamondBalance ARTAR
 */
exports.sendDonation = onRequest(async (req, res) => {
  const fromUid = await requireAuth(req, res);
  if (!fromUid) return;

  const body = parseBody(req);
  if (!body) {
    return res.status(400).json({ error: "invalid-body" });
  }

  const { toUid, amount } = body;
  const amt = Number(amount);

  if (!toUid || amt <= 0) {
    return res.status(400).json({ error: "invalid-amount" });
  }

  const fromRef = db.collection("users").doc(fromUid);
  const toRef = db.collection("users").doc(toUid);

  try {
    await db.runTransaction(async (trx) => {
      /* 🔴 YENİ / EKLENDİ — READ (EN BAŞTA OLMALI) */
      const supporterRef = toRef
        .collection("topSupporters")
        .doc(fromUid);

      const supporterSnap = await trx.get(supporterRef);
      /* 🔴 YENİ / EKLENDİ */
      const fromSnap = await trx.get(fromRef);
      const toSnap = await trx.get(toRef);

      if (!fromSnap.exists || !toSnap.exists) {
        throw new Error("user-not-found");
      }

      const from = fromSnap.data();
      const to = toSnap.data();
       // ✅ YENİ — TopSupporters için snapshot (hız için)  ⬅️ TAM BURAYA
     const supporterMeta = {
  uid: fromUid,
  username: from.username || "Kullanıcı",
  avatar: from.avatar || null,
};

      const fromBalance = from.vbBalance ?? 0;
      if (fromBalance < amt) {
        throw new Error("insufficient-balance");
      }

      // 🔻 GÖNDEREN (A)
      trx.update(fromRef, {
        vbBalance: fromBalance - amt,

        // ✅ BAĞIŞ GÖNDEREN TOPLAMI (LEVEL / VIP İÇİN)
        vbTotalSent: (from.vbTotalSent ?? 0) + amt,

        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 🔺 ALAN (B) — SADECE ELMAS
      trx.update(toRef, {
        totalReceived: (to.totalReceived ?? 0) + amt,
        diamondBalance: (to.diamondBalance ?? 0) + amt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      /* 🔴 YENİ / EKLENDİ — SADECE WRITE */
      updateTopSupporter(
        trx,
        supporterRef,
        supporterSnap,
        amt,
        supporterMeta // ✅ YENİ parametre
      );

      // 🧾 BAĞIŞ GEÇMİŞİ (SADECE LOG)
      trx.set(db.collection("donationHistory").doc(), {
        fromUid,
        toUid,
        amount: amt,

        // Gönderen kısa bilgi (UI için)
        fromUser: {
          uid: fromUid,
          username: from.username || "",
          avatar: from.avatar || null,
          role: from.role || "user",
        },

        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("sendDonation_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});
