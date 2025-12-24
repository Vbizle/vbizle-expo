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
const { writeVbLoadTransaction } = require("./transactions/writeTransaction");
const { sendAppMessage } = require("./appMessages/appMessageEngine");
const { vbLoaded } = require("./appMessages/messageTemplates");


console.log("INDEX_LOADED: Functions loaded");

/* ============================================================
   2-B) ADMIN / DEALER → VBID LOAD
   - VIP SADECE: dealer | google_play
============================================================ */
exports.VbAdminByVbId = onRequest(async (req, res) => {
  console.log("🔥 VbAdminByVbId_RAW_REQUEST", {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  const callerUid = await requireAuth(req, res);
  if (!callerUid) return;

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

    /* ================================
       BAYİ YÜKLEMESİ
    ================================= */
    if (source === "dealer") {
      const dealerSnap = await trx.get(callerRef);
      const dealer = dealerSnap.data();

      const wallet = dealer.dealerWallet ?? 0;
      if (wallet < amt) throw new Error("dealer-insufficient-wallet");

      trx.update(callerRef, {
        dealerWallet: wallet - amt,
      });

      trx.set(db.collection("dealerHistory").doc(), {
        dealerUid: callerUid,
        toUid: targetDoc.id,
        toVbId: normalized,
        amount: amt,
        createdAt: Date.now(),
      });
    }

    /* ================================
       KULLANICI BAKİYESİ
    ================================= */
    trx.update(targetDoc.ref, {
      // ✅ SATIN ALIM / ROOT / BAYİ → SADECE VB BAKİYE
      vbBalance: (target.vbBalance ?? 0) + amt,

      // (opsiyonel) VIP hala yüklemeyle artsın istiyorsan
      vipScore: (target.vipScore ?? 0) + amt,

      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

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

  // 🔥 TRANSACTION TAMAMLANDI → EVENT WRITE (SVP BURADAN TETİKLENİR)
  await writeVbLoadTransaction({
    toUid: targetDoc.id,
    toVbId: normalized,
    amount: amt,
    source: source === "dealer" ? "dealer" : "root",
    fromUid: callerUid,
  });
  await sendAppMessage({
  toUid: targetDoc.id,
  ...vbLoaded(amt),
});


  return res.json({ success: true });
} catch (err) {
  console.error("VbAdminByVbId_ERROR:", err.message);
  return res.status(400).json({ error: err.message });
}
});

/* ============================================================
   3-A) ROOT → USER VB BALANCE DECREASE
   (VIP ETKİLENMEZ)
============================================================ */
exports.RootDecreaseUserBalance = onRequest(async (req, res) => {
  const callerUid = await requireAuth(req, res);
  if (!callerUid) return;

  const role = await getUserRole(callerUid);
  if (!isRoot(role)) {
    return res.status(403).json({ error: "permission-denied" });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { toUid, amount } = body;
  const amt = Number(amount);
  if (!toUid || !amt || amt <= 0) {
    return res.status(400).json({ error: "invalid-amount" });
  }

  const adminInfo = await getUserShort(callerUid);
  const userRef = db.collection("users").doc(toUid);

  try {
    await db.runTransaction(async (trx) => {
      const snap = await trx.get(userRef);
      if (!snap.exists) throw new Error("not-found");

      const user = snap.data();
      const balance = user.vbBalance ?? 0;
      if (balance < amt) throw new Error("insufficient-balance");

      trx.update(userRef, {
        vbBalance: balance - amt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      trx.set(db.collection("loadHistory").doc(), {
        type: "root_decrease",
        source: "root",
        admin: adminInfo,
        toUid,
        amount: amt,
        createdAt: Date.now(),
      });
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/* ============================================================
   3-B) ROOT → DEALER WALLET DECREASE
============================================================ */
exports.RootDecreaseDealerWallet = onRequest(async (req, res) => {
  const callerUid = await requireAuth(req, res);
  if (!callerUid) return;

  const role = await getUserRole(callerUid);
  if (!isRoot(role)) {
    return res.status(403).json({ error: "permission-denied" });
  }

  const body = parseBody(req);
  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { toUid, amount } = body;
  const amt = Number(amount);
  if (!toUid || !amt || amt <= 0) {
    return res.status(400).json({ error: "invalid-amount" });
  }

  const adminInfo = await getUserShort(callerUid);
  const userRef = db.collection("users").doc(toUid);

  try {
    await db.runTransaction(async (trx) => {
      const snap = await trx.get(userRef);
      if (!snap.exists) throw new Error("not-found");

      const user = snap.data();
      const wallet = user.dealerWallet ?? 0;
      if (wallet < amt) throw new Error("insufficient-dealer-wallet");

      trx.update(userRef, {
        dealerWallet: wallet - amt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      trx.set(db.collection("loadHistory").doc(), {
        type: "root_dealer_decrease",
        source: "root",
        admin: adminInfo,
        toUid,
        amount: amt,
        createdAt: Date.now(),
      });
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

exports.VipEngine = require("./vipLevel/VipEngine").VipEngine;
exports.LevelEngine = require("./vipLevel/LevelEngine").LevelEngine;
// functions/index.js
const withdraw = require("./wallet/withdraw");
exports.createWithdrawRequest = withdraw.createWithdrawRequest;

// ==================================================
// WITHDRAW ADMIN FUNCTIONS (EKLENDİ)
// ==================================================
const withdrawAdmin = require("./wallet/withdrawAdmin");

exports.approveWithdrawRequest = withdrawAdmin.approveWithdrawRequest;
exports.rejectWithdrawRequest = withdrawAdmin.rejectWithdrawRequest;

exports.sendDonation =
  require("./earnings/sendDonation").sendDonation;

exports.convertDiamondToVB = require("./wallet/convertDiamondToVB");
exports.syncUserRoles = require("./roles/syncUserRoles").syncUserRoles;
// ==================================================
// SVP ENGINE (YENİ)
// ==================================================
exports.onTransactionWrite =
  require("./svp/svpEngine").onTransactionWrite;
  exports.onDealerHistoryWrite =
  require("./svp/svpEngine").onDealerHistoryWrite;
  exports.runDailySvpDecay =
  require("./svp/svpDecayScheduler").runDailySvpDecay;
 exports.sendRootAnnouncement =
  require("./systemDm/sendRootAnnouncement").sendRootAnnouncement;
exports.expirePremiumStatuses =
  require("./premium/expirePremiumStatuses").expirePremiumStatuses;
// MARKET
const market = require("./market");
exports.purchaseMarketItem = market.purchaseMarketItem;
exports.expireInventoryItems = require("./schedulers/expireInventoryItems")
  .expireInventoryItems;
  exports.presenceCleanup =
  require("./schedulers/presenceCleanup").presenceCleanup;












