const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * 🔥 EVENT TETİKLEYEN AYRI WRITE
 * (Transaction DIŞINDA çağrılmalı)
 */
async function writeVbLoadTransaction({
  toUid,
  toVbId,
  amount,
  source,
  fromUid,
}) {
  return db.collection("transactions").add({
    type: "vb_load",
    toUid,
    toVbId,
    amount: Number(amount),
    source: source || "root",
    fromUid,
    createdAt: Date.now(),
  });
}

module.exports = { writeVbLoadTransaction };
