const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const { parseBody, requireAuth } = require("../core/request");

const db = admin.firestore();

/* ============================================================
   VIP ENGINE
   KURAL: BAKİYE ARTIYORSA → VIP ARTSIN
============================================================ */
exports.VipEngine = onRequest(async (req, res) => {
  const callerUid = await requireAuth(req, res);
  if (!callerUid) return;

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { targetUid, amount } = body;
  const amt = Number(amount);

  if (!targetUid || !amt || amt <= 0) {
    return res.status(400).json({ error: "invalid-params" });
  }

  try {
    await db.runTransaction(async (trx) => {
      const userRef = db.collection("users").doc(targetUid);
      const snap = await trx.get(userRef);
      if (!snap.exists) throw new Error("user-not-found");

      trx.update(userRef, {
        vipScore: admin.firestore.FieldValue.increment(amt),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("VipEngine_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});
