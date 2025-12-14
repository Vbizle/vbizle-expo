// functions/wallet/withdrawAdmin.js
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

const { requireAuth } = require("../core/request");
const { db, getUserRole } = require("../core/helpers");

/* ==========================================================
   ADMIN / ROOT — APPROVE
========================================================== */
exports.approveWithdrawRequest = onRequest(async (req, res) => {
  try {
    const uid = await requireAuth(req, res);
    const role = await getUserRole(uid);

    if (role !== "admin" && role !== "root") {
      return res.status(403).json({ ok: false, error: "Yetkisiz." });
    }

    const { requestId } = req.body || {};
    if (!requestId) {
      return res.status(400).json({ ok: false, error: "requestId zorunlu." });
    }

    const reqRef = db.collection("withdrawRequests").doc(requestId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(reqRef);
      if (!snap.exists) throw new Error("REQUEST_NOT_FOUND");

      const d = snap.data();
      if (d.status !== "pending") {
        throw new Error("ALREADY_PROCESSED");
      }

      tx.update(reqRef, {
        status: "approved",
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
        approvedBy: uid,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ ok: true });
  } catch (e) {
    const msg = String(e.message || e);

    if (msg.includes("REQUEST_NOT_FOUND")) {
      return res.status(404).json({ ok: false, error: "Talep bulunamadı." });
    }
    if (msg.includes("ALREADY_PROCESSED")) {
      return res
        .status(400)
        .json({ ok: false, error: "Talep zaten işlenmiş." });
    }

    console.error("approveWithdrawRequest error:", e);
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
});

/* ==========================================================
   ADMIN / ROOT — REJECT (OTOMATİK ELMAŞ İADESİ)
========================================================== */
exports.rejectWithdrawRequest = onRequest(async (req, res) => {
  try {
    const adminUid = await requireAuth(req, res);
    const role = await getUserRole(adminUid);

    if (role !== "admin" && role !== "root") {
      return res.status(403).json({ ok: false, error: "Yetkisiz." });
    }

    const { requestId, reason } = req.body || {};
    if (!requestId) {
      return res.status(400).json({ ok: false, error: "requestId zorunlu." });
    }

    const reqRef = db.collection("withdrawRequests").doc(requestId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(reqRef);
      if (!snap.exists) throw new Error("REQUEST_NOT_FOUND");

      const d = snap.data();
      if (d.status !== "pending") {
        throw new Error("ALREADY_PROCESSED");
      }

      const userRef = db.collection("users").doc(d.userId);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("USER_NOT_FOUND");

      const current = Number(userSnap.data().diamondBalance ?? 0);
      const refund = Number(d.diamondAmount ?? 0);

      // 💎 Elması geri ver
      tx.update(userRef, {
        diamondBalance: current + refund,
      });

      // ❌ Talebi iptal et
      tx.update(reqRef, {
        status: "rejected",
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy: adminUid,
        rejectReason: reason || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ ok: true });
  } catch (e) {
    const msg = String(e.message || e);

    if (msg.includes("REQUEST_NOT_FOUND")) {
      return res.status(404).json({ ok: false, error: "Talep bulunamadı." });
    }
    if (msg.includes("USER_NOT_FOUND")) {
      return res.status(404).json({ ok: false, error: "Kullanıcı yok." });
    }
    if (msg.includes("ALREADY_PROCESSED")) {
      return res
        .status(400)
        .json({ ok: false, error: "Talep zaten işlenmiş." });
    }

    console.error("rejectWithdrawRequest error:", e);
    return res.status(500).json({ ok: false, error: "Sunucu hatası." });
  }
});
