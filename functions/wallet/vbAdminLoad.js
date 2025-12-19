require("../core/init");

const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");

const {
  parseBody,
  requireAuth,
} = require("../core/request");

const {
  isRoot,
  isAdmin,
  isDealer,
  getUserRole, // ✅ EKSİK OLAN BUYDU
} = require("../core/helpers");

const {
  sendAppMessage,
} = require("../appMessages/appMessageEngine");

const {
  vbLoaded,
} = require("../appMessages/messageTemplates");

const db = admin.firestore();

/**
 * Root / Admin / Dealer -> Kullanıcıya VB Yükleme
 */
exports.VbAdminByVbId = onRequest(async (req, res) => {
  try {
    const body = parseBody(req);
    const authUser = await requireAuth(req);

    const { targetUid, amount } = body;

    if (!targetUid || !amount || amount <= 0) {
      return res.status(400).json({ error: "Geçersiz parametre" });
    }

    const role = await getUserRole(authUser.uid);

    if (!isRoot(role) && !isAdmin(role) && !isDealer(role)) {
      return res.status(403).json({ error: "Yetkisiz" });
    }

    // 🔐 FİNANSAL TRANSACTION
    await db.runTransaction(async (tx) => {
      const userRef = db.collection("users").doc(targetUid);
      const snap = await tx.get(userRef);

      if (!snap.exists) {
        throw new Error("Kullanıcı bulunamadı");
      }

      const prev = snap.data().vbBalance || 0;

      tx.update(userRef, {
        vbBalance: prev + amount,
      });

      // writeTransaction(...) varsa burada
    });

    // 🔔 SİSTEM MESAJI (OMURGA)
    await sendAppMessage({
      toUid: targetUid,
      ...vbLoaded(amount),
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("VbAdminByVbId error:", err);
    return res.status(500).json({ error: err.message });
  }
});
