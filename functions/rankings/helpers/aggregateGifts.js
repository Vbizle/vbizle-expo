const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Aggregate donationHistory by uid
 * groupBy:
 * - "senderUid" → Destekçiler
 * - "toUid"     → Yayıncılar
 */
async function aggregateGifts({
  from,
  to,
  groupBy,
  limit = 25,
}) {
  // 🔒 Timestamp garanti altına al
  const fromTs =
    from instanceof admin.firestore.Timestamp
      ? from
      : admin.firestore.Timestamp.fromDate(new Date(from));

  const toTs =
    to instanceof admin.firestore.Timestamp
      ? to
      : admin.firestore.Timestamp.fromDate(new Date(to));

  const snap = await db
    .collection("donationHistory")
    .where("createdAt", ">=", fromTs)
    .where("createdAt", "<", toTs)
    .get();

  const map = {};

  snap.forEach((doc) => {
    const d = doc.data();
    if (!d) return;

    const key = d[groupBy];
    if (!key) return;

    const amount = Number(d.amount || 0);
    map[key] = (map[key] || 0) + amount;
  });

  return Object.entries(map)
    .map(([uid, total]) => ({ uid, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

module.exports = { aggregateGifts };
