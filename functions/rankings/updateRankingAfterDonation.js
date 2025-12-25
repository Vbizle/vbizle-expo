const admin = require("firebase-admin");
const db = admin.firestore();

const PERIODS = ["daily", "weekly", "monthly"];

async function updateRankingAfterDonation({ fromUid, toUid, amount }) {
  const now = admin.firestore.FieldValue.serverTimestamp();

  for (const period of PERIODS) {
    // SUPPORTERS
    await updateList({
      path: `rankings/supporters/${period}/current`,
      uid: fromUid,
      amount,
      now,
    });

    // BROADCASTERS
    await updateList({
      path: `rankings/broadcasters/${period}/current`,
      uid: toUid,
      amount,
      now,
    });
  }
}

async function updateList({ path, uid, amount, now }) {
  const ref = db.doc(path);

  await db.runTransaction(async (trx) => {
    const snap = await trx.get(ref);
    const data = snap.exists ? snap.data() : { list: [] };

    let list = Array.isArray(data.list) ? [...data.list] : [];

    const idx = list.findIndex((i) => i.uid === uid);

    if (idx >= 0) {
      list[idx].total += amount;
    } else {
      list.push({ uid, total: amount });
    }

    list.sort((a, b) => b.total - a.total);
    list = list.slice(0, 25);

    trx.set(
      ref,
      {
        list,
        updatedAt: now,
      },
      { merge: true }
    );
  });
}

module.exports = { updateRankingAfterDonation };
