// functions/premium/expirePremiumStatuses.js

const admin = require("firebase-admin");
const { onSchedule } = require("firebase-functions/v2/scheduler");

const db = admin.firestore();

/**
 * Süresi dolmuş premium statüleri temizler
 * Günde 1 kere çalışır
 */
exports.expirePremiumStatuses = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "Europe/Istanbul",
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const snapshot = await db
      .collection("users")
      .where("premiumStatus.expiresAt", "<=", now)
      .get();

    if (snapshot.empty) {
      console.log("No expired premium statuses found");
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((d) => {
      batch.update(d.ref, { premiumStatus: null });
    });

    await batch.commit();
    console.log(`Expired premium statuses cleared: ${snapshot.size}`);
  }
);
