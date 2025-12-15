const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

const { db } = require("../core/helpers");
const { requireAuth } = require("../core/request");

/**
 * =========================================================
 *  ELMAŞ → VB BAKİYE DÖNÜŞÜM
 *
 *  Kurallar:
 *  - Minimum: 2500 elmas
 *  - Oran: 2 Elmas = 1 VB
 *  - Transaction zorunlu
 * =========================================================
 */
module.exports = onRequest(async (req, res) => {
  try {
    // 🔐 Auth
    const uid = await requireAuth(req);

    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      throw new Error("Geçersiz miktar.");
    }

    if (amount < 2500) {
      throw new Error("Minimum dönüşüm 2500 elmas.");
    }

    const userRef = db.collection("users").doc(uid);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);

      if (!snap.exists) {
        throw new Error("Kullanıcı bulunamadı.");
      }

      const user = snap.data();

      const diamondBalance = user.diamondBalance || 0;
      const vbBalance = user.vbBalance || 0;

      if (diamondBalance < amount) {
        throw new Error("Yetersiz elmas bakiyesi.");
      }

      // 🔢 Dönüşüm oranı
      const vbAmount = Math.floor(amount / 2);

      // 🔄 Bakiye güncelle
      tx.update(userRef, {
        diamondBalance: diamondBalance - amount,
        vbBalance: vbBalance + vbAmount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 🧾 Log
      tx.set(db.collection("diamondConvertHistory").doc(), {
        userId: uid,
        diamondAmount: amount,
        vbAmount,
        rate: "2:1",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({
      success: true,
      message: "Elmaslar başarıyla VB bakiyeye dönüştürüldü.",
    });
  } catch (err) {
    console.error("convertDiamondToVB error:", err);

    return res.status(400).json({
      error: err.message || "Dönüşüm işlemi başarısız.",
    });
  }
});
