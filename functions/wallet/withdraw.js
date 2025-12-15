// functions/wallet/withdraw.js
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

const { parseBody, requireAuth } = require("../core/request");
const { db, getUserShort } = require("../core/helpers");

exports.createWithdrawRequest = onRequest(async (req, res) => {
  try {
    const uid = await requireAuth(req, res);

    const body = parseBody(req);
    const amountRaw = body?.amount;

    const fullName = String(body?.fullName || "").trim();
    const bankName = String(body?.bankName || "").trim();
    const iban = String(body?.iban || "").trim();

    const amount = Number(amountRaw);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ ok: false, error: "Geçersiz miktar." });
    }

    const intAmount = Math.floor(amount);

    if (intAmount < 5000) {
      return res
        .status(400)
        .json({ ok: false, error: "Minimum çekim 5000 elmas." });
    }
    if (!fullName || !bankName || !iban) {
      return res
        .status(400)
        .json({ ok: false, error: "Ad Soyad / Banka / IBAN zorunlu." });
    }

    /* ==========================================================
   🔒 24 SAAT / TEK PENDING KONTROLÜ (INDEX'SİZ)
========================================================== */
const now = Date.now();
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// 1️⃣ Pending var mı? (index gerekmez)
const pendingSnap = await db
  .collection("withdrawRequests")
  .where("userId", "==", uid)
  .where("status", "==", "pending")
  .limit(1)
  .get();

if (!pendingSnap.empty) {
  return res.status(400).json({
    ok: false,
    error:
      "Bekleyen talebiniz var sonuçlanmasını bekleyin. ( Çekim talepleri 24 saatlik sürede yanlızca bir kez yapılabilir.)",
  });
}

// 2️⃣ Son talep (index gerekmez)
const lastReqSnap = await db
  .collection("withdrawRequests")
  .where("userId", "==", uid)
  .orderBy("createdAt", "desc")
  .limit(1)
  .get();

if (!lastReqSnap.empty) {
  const lastReq = lastReqSnap.docs[0].data();

  const createdAt =
    typeof lastReq.createdAt === "number"
      ? lastReq.createdAt
      : lastReq.createdAt?.toMillis?.();

 if (
  lastReq.status !== "rejected" &&
  createdAt &&
  now - createdAt < TWENTY_FOUR_HOURS
) {
  return res.status(400).json({
    ok: false,
    error:
      "Bekleyen talebiniz var sonuçlanmasını bekleyin. ( Çekim talepleri 24 saatlik sürede yanlızca bir kez yapılabilir.)",
  });
}

}

    // ✅ Helpers ile aynı okuma tarzı
    const userRef = db.collection("users").doc(uid);
    const reqRef = db.collection("withdrawRequests").doc();

    // 🔎 DEBUG: transaction dışı okuma
    const preSnap = await userRef.get();
    console.log("WITHDRAW_DEBUG", {
      uid,
      userPath: userRef.path,
      preExists: preSnap.exists,
      preDiamond: preSnap.exists ? preSnap.data()?.diamondBalance : null,
      projectId: admin.app().options?.projectId || null,
    });

    const userShort = await getUserShort(uid).catch(() => ({}));

    const result = await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);

      // 🔎 DEBUG: transaction içi durum
      console.log("WITHDRAW_TX_DEBUG", {
        uid,
        txExists: userSnap.exists,
        txPath: userRef.path,
      });

      if (!userSnap.exists) {
        throw new Error("USER_NOT_FOUND");
      }

      const u = userSnap.data() || {};
      const currentDiamonds = Number(u.diamondBalance ?? 0);

      if (!Number.isFinite(currentDiamonds) || currentDiamonds < intAmount) {
        throw new Error("INSUFFICIENT_DIAMONDS");
      }

      const newBalance = currentDiamonds - intAmount;

      tx.update(userRef, {
        diamondBalance: newBalance,
        lastWithdrawAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.set(reqRef, {
        userId: uid,
        vbId: userShort?.vbId || u.vbId || null,
        username: userShort?.username || u.username || null,
        avatar: userShort?.avatar || u.avatar || null,

        diamondAmount: intAmount,
        usdAmount: intAmount, // şimdilik 1/1

        fullName,
        bankName,
        iban,

        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { requestId: reqRef.id, newDiamondBalance: newBalance };
    });

    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    const msg = String(e?.message || e);

    if (msg.includes("INSUFFICIENT_DIAMONDS")) {
      return res.status(400).json({ ok: false, error: "Yetersiz elmas." });
    }
    if (msg.includes("USER_NOT_FOUND")) {
      return res.status(404).json({ ok: false, error: "Kullanıcı yok." });
    }

    console.error("createWithdrawRequest error:", e);
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
});
