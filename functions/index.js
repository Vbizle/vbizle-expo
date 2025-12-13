// functions/index.js

require("./core/init");
const admin = require("firebase-admin");

const { onRequest } = require("firebase-functions/v2/https");
const { parseBody, requireAuth } = require("./core/request");
const {
  db,
  getUserRole,
  getUserShort,
  isRoot,
  isAdmin,
} = require("./core/helpers");

console.log("INDEX_LOADED: Functions loaded");

/* ============================================================
   2-B) ADMIN / DEALER → VBID LOAD (FINAL + DEBUG)
============================================================ */
exports.VbAdminByVbId = onRequest(async (req, res) => {
  // 🔴 EN KRİTİK LOG — İSTEK GELİYOR MU?
  console.log("🔥 VbAdminByVbId_RAW_REQUEST", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  const callerUid = await requireAuth(req, res);
  if (!callerUid) {
    console.log("⛔ VbAdminByVbId_AUTH_FAILED");
    return;
  }

  console.log("✅ VbAdminByVbId_AUTH_OK", callerUid);

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { toVbId, amount, source } = body;
  const amt = Number(amount);

  const callerRole = await getUserRole(callerUid);
  if (!isAdmin(callerRole)) {
    return res.status(403).json({ error: "permission-denied" });
  }

  const normalized = toVbId.trim().toUpperCase();
  const snap = await db
    .collection("users")
    .where("vbId", "==", normalized)
    .get();

  if (snap.empty) return res.status(404).json({ error: "not-found" });

  const targetDoc = snap.docs[0];
  const callerInfo = await getUserShort(callerUid);
  const callerRef = db.collection("users").doc(callerUid);

  try {
    await db.runTransaction(async (trx) => {
      const targetSnap = await trx.get(targetDoc.ref);
      if (!targetSnap.exists) throw new Error("not-found");

      const target = targetSnap.data();

      // ⭐ BAYİ YÜKLEME İSE → dealerWallet düş
      if (source === "dealer") {
        const dealerSnap = await trx.get(callerRef);
        const dealer = dealerSnap.data();

        const wallet = dealer.dealerWallet ?? 0;
        if (wallet < amt) throw new Error("dealer-insufficient-wallet");

        trx.update(callerRef, {
          dealerWallet: wallet - amt,
        });

        // ⭐ dealerHistory
        trx.set(db.collection("dealerHistory").doc(), {
          dealerUid: callerUid,
          toUid: targetDoc.id,
          toVbId: normalized,
          amount: amt,
          createdAt: Date.now(),
        });
      }

      // ⭐ KULLANICI BAKİYESİ
      trx.update(targetDoc.ref, {
        vbBalance: (target.vbBalance ?? 0) + amt,
        vbTotalReceived: (target.vbTotalReceived ?? 0) + amt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ⭐ loadHistory (HER ZAMAN)
      trx.set(db.collection("loadHistory").doc(), {
        type: "admin_load_vbid",
        admin: callerInfo,
        toUid: targetDoc.id,
        toVbId: normalized,
        source: source || "root",
        amount: amt,
        createdAt: Date.now(),
      });
    });

    return res.json({ success: true });

  } catch (err) {
    console.error("VbAdminByVbId_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});
