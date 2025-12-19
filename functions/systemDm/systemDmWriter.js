const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * 🔔 SYSTEM DM YAZICI
 * SADECE DM + inbox işini yapar
 * ❌ appMessages YAZMAZ
 */
async function writeSystemDmMessage({
  toUid,
  type,
  title,
  body,
  meta = {},
}) {
  const SYSTEM_DM_ID = "system_vbteam";

  const msgRef = db
    .collection("dm")
    .doc(SYSTEM_DM_ID)
    .collection("messages")
    .doc();

  const metaRef = db
    .collection("dm")
    .doc(SYSTEM_DM_ID)
    .collection("meta")
    .doc("info");

  const now = admin.firestore.FieldValue.serverTimestamp();

  // 1️⃣ Mesajı yaz (SYSTEM DM)
  await msgRef.set({
    toUid,
    type,
    title,
    body,
    meta,
    createdAt: now,
    system: true,
  });

  // 2️⃣ UNREAD arttır (DM META)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(metaRef);
    const data = snap.exists ? snap.data() : {};

    const unread = data.unread || {};
    unread[toUid] = (unread[toUid] || 0) + 1;

    tx.set(
      metaRef,
      {
        unread,
        lastMessageAt: now,
      },
      { merge: true }
    );
  });

  // 3️⃣ systemInbox badge arttır
  await db
    .collection("systemInbox")
    .doc(toUid)
    .set(
      {
        unreadCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      },
      { merge: true }
    );
}

module.exports = {
  writeSystemDmMessage,
};
