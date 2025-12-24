const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

exports.presenceCleanup = onSchedule(
  {
    schedule: "every 2 minutes",
    region: "us-central1",
  },
  async () => {
    const cutoffMs = Date.now() - 2 * 60 * 1000;

    const snap = await db
      .collection("users")
      .where("online", "==", true)
      .get();

    if (snap.empty) {
      console.log("presenceCleanup: no online users");
      return;
    }

    const batch = db.batch();
    let count = 0;

    snap.docs.forEach((doc) => {
      const data = doc.data();
      if (
        data.lastSeen &&
        data.lastSeen.toMillis &&
        data.lastSeen.toMillis() < cutoffMs
      ) {
        batch.update(doc.ref, { online: false });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`presenceCleanup: set offline ${count} user(s)`);
    } else {
      console.log("presenceCleanup: no stale users");
    }
  }
);
