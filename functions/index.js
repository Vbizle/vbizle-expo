// functions/index.js

// 1) Firebase Admin başlatma
require("./core/init");
const admin = require("firebase-admin");

// 2) Modüller
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
   0-B) ROLE AYARLAMA
============================================================ */
exports.VbSetRole = onRequest(async (req, res) => {
  console.log("VbSetRole_CALLED");

  const uid = await requireAuth(req, res);
  if (!uid) return;
  console.log("VbSetRole_AUTH_OK:", uid);

  const body = parseBody(req);
  console.log("VbSetRole_BODY:", body);

  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { targetVbId, role } = body;

  const callerRole = await getUserRole(uid);
  console.log("VbSetRole_CALLER_ROLE:", callerRole);

  if (!isRoot(callerRole)) {
    console.log("VbSetRole_DENIED");
    return res.status(403).json({ error: "permission-denied" });
  }

  const normalized = targetVbId.trim().toUpperCase();
  const snap = await db.collection("users").where("vbId", "==", normalized).get();

  if (snap.empty) return res.status(404).json({ error: "not-found" });

  const targetDoc = snap.docs[0];

  await targetDoc.ref.update({
    role,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("VbSetRole_SUCCESS");
  return res.json({ success: true });
});



/* ============================================================
   1) VB GÖNDERME — LOG EKLENDİ
============================================================ */
exports.VbGonder = onRequest(async (req, res) => {
  console.log("VbGonder_CALLED");

  const senderUid = await requireAuth(req, res);
  if (!senderUid) return;
  console.log("VbGonder_AUTH_OK:", senderUid);

  const body = parseBody(req);
  console.log("VbGonder_BODY:", body);
  if (!body) return res.status(400).json({ error: "invalid-body" });

  const { toUid, amount, roomId } = body;
  const amt = Number(amount);
  console.log("VbGonder_PARSED:", { toUid, amt, roomId });

  const senderRef = db.collection("users").doc(senderUid);
  const receiverRef = db.collection("users").doc(toUid);
  const roomRef = roomId ? db.collection("rooms").doc(roomId) : null;

  try {
    await db.runTransaction(async (trx) => {
      console.log("VbGonder_TX_START");

      const sSnap = await trx.get(senderRef);
      const rSnap = await trx.get(receiverRef);

      if (!sSnap.exists || !rSnap.exists) throw new Error("not-found");

      const s = sSnap.data();
      const r = rSnap.data();

      if ((s.vbBalance ?? 0) < amt) throw new Error("insufficient-balance");

      trx.update(senderRef, {
        vbBalance: (s.vbBalance ?? 0) - amt,
        vbTotalSent: (s.vbTotalSent ?? 0) + amt,
      });

      trx.update(receiverRef, {
        vbBalance: (r.vbBalance ?? 0) + amt,
        vbTotalReceived: (r.vbTotalReceived ?? 0) + amt,
        vipPoints: (r.vipPoints ?? 0) + amt,
      });

      if (roomRef) {
        const roomSnap = await trx.get(roomRef);
        if (roomSnap.exists) {
          trx.update(roomRef, {
            donationCurrent:
              (roomSnap.data().donationCurrent ?? 0) + amt,
          });
        }
      }

      // ⭐ LOADHISTORY transaction içinde
      console.log("VbGonder_HISTORY_WRITE_START");

      const historyRef = db.collection("loadHistory").doc();
      trx.set(historyRef, {
        type: "transfer",
        fromUid: senderUid,
        toUid,
        amount: amt,
        createdAt: Date.now(),
      });

      console.log("VbGonder_HISTORY_WRITE_OK");
      console.log("VbGonder_TX_END");
    });

    console.log("VbGonder_SUCCESS");
    return res.json({ success: true });

  } catch (err) {
    console.error("VbGonder_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});



/* ============================================================
   2) ADMIN UID LOAD — LOG EKLENDİ
============================================================ */
exports.VbAdmin = onRequest(async (req, res) => {
  console.log("VbAdmin_CALLED");

  const adminUid = await requireAuth(req, res);
  if (!adminUid) return;
  console.log("VbAdmin_AUTH_OK:", adminUid);

  const body = parseBody(req);
  console.log("VbAdmin_BODY:", body);

  const { targetUid, amount, source } = body;
  const amt = Number(amount);

  const role = await getUserRole(adminUid);
  console.log("VbAdmin_CALLER_ROLE:", role);

  if (!isAdmin(role)) {
    console.log("VbAdmin_DENIED");
    return res.status(403).json({ error: "permission-denied" });
  }

  const targetRef = db.collection("users").doc(targetUid);
  const adminInfo = await getUserShort(adminUid);

  try {
    await db.runTransaction(async (trx) => {
      console.log("VbAdmin_TX_START");

      const snap = await trx.get(targetRef);
      if (!snap.exists) throw new Error("not-found");

      const d = snap.data();

      trx.update(targetRef, {
        vbBalance: (d.vbBalance ?? 0) + amt,
        vbTotalReceived: (d.vbTotalReceived ?? 0) + amt,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ⭐ HISTORY yaz
      console.log("VbAdmin_HISTORY_WRITE_START");

      const historyRef = db.collection("loadHistory").doc();
      trx.set(historyRef, {
        type: "admin_load_uid",
        admin: adminInfo,
        targetUid,
        source: source || "root",
        amount: amt,
        createdAt: Date.now(),
      });

      console.log("VbAdmin_HISTORY_WRITE_OK");
      console.log("VbAdmin_TX_END");
    });

    console.log("VbAdmin_SUCCESS");
    return res.json({ success: true });

  } catch (err) {
    console.error("VbAdmin_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});



/* ============================================================
   2-B) ADMIN VBID LOAD — LOG EKLENDİ
============================================================ */
exports.VbAdminByVbId = onRequest(async (req, res) => {
  console.log("VbAdminByVbId_CALLED");

  const adminUid = await requireAuth(req, res);
  if (!adminUid) return;
  console.log("VbAdminByVbId_AUTH_OK:", adminUid);

  const body = parseBody(req);
  console.log("VbAdminByVbId_BODY:", body);

  const { toVbId, amount, source } = body;
  const amt = Number(amount);

  const role = await getUserRole(adminUid);
  console.log("VbAdminByVbId_CALLER_ROLE:", role);

  if (!isAdmin(role)) {
    console.log("VbAdminByVbId_DENIED");
    return res.status(403).json({ error: "permission-denied" });
  }

  const normalized = toVbId.trim().toUpperCase();
  const snap = await db
    .collection("users")
    .where("vbId", "==", normalized)
    .get();

  if (snap.empty) return res.status(404).json({ error: "not-found" });

  const targetDoc = snap.docs[0];
  const adminInfo = await getUserShort(adminUid);

  try {
    await db.runTransaction(async (trx) => {
      console.log("VbAdminByVbId_TX_START");

      const uSnap = await trx.get(targetDoc.ref);
      if (!uSnap.exists) throw new Error("not-found");

      const u = uSnap.data();

      trx.update(targetDoc.ref, {
        vbBalance: (u.vbBalance ?? 0) + amt,
        vbTotalReceived: (u.vbTotalReceived ?? 0) + amt,
        lastReceivedFrom: normalized,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("VbAdminByVbId_HISTORY_WRITE_START");

      const historyRef = db.collection("loadHistory").doc();
      trx.set(historyRef, {
        type: "admin_load_vbid",
        admin: adminInfo,
        toVbId: normalized,
        toUid: targetDoc.id,
        source: source || "root",
        amount: amt,
        createdAt: Date.now(),
      });

      console.log("VbAdminByVbId_HISTORY_WRITE_OK");
      console.log("VbAdminByVbId_TX_END");
    });

    console.log("VbAdminByVbId_SUCCESS");
    return res.json({ success: true });

  } catch (err) {
    console.error("VbAdminByVbId_ERROR:", err.message);
    return res.status(400).json({ error: err.message });
  }
});



/* ============================================================
   4) BAĞIŞ BAR TOGGLE
============================================================ */
exports.VbBagisBarToggle = onRequest(async (req, res) => {
  console.log("VbBagisBarToggle_CALLED");

  const userUid = await requireAuth(req, res);
  if (!userUid) return;
  console.log("VbBagisBarToggle_AUTH_OK:", userUid);

  const body = parseBody(req);
  console.log("VbBagisBarToggle_BODY:", body);

  const { roomId } = body;

  const roomRef = db.collection("rooms").doc(roomId);
  const roomSnap = await roomRef.get();

  if (!roomSnap.exists) return res.status(404).json({ error: "not-found" });

  const room = roomSnap.data();

  const newState = !room.donationBarEnabled;

  await roomRef.update({
    donationBarEnabled: newState,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("VbBagisBarToggle_SUCCESS:", newState);

  return res.json({ enabled: newState });
});
