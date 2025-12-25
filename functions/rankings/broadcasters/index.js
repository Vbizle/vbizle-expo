const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { getTimeRange } = require("../helpers/timeRanges");
const { aggregateGifts } = require("../helpers/aggregateGifts");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.broadcastersRankingJob = onSchedule(
  { schedule: "every 5 minutes", region: "us-central1" },
  async () => {
    try {
      const daily = getTimeRange("daily");
      const weekly = getTimeRange("weekly");
      const monthly = getTimeRange("monthly");

      const [dailyList, weeklyList, monthlyList] = await Promise.all([
        aggregateGifts({ ...daily, groupBy: "toUid", limit: 25 }),
        aggregateGifts({ ...weekly, groupBy: "toUid", limit: 25 }),
        aggregateGifts({ ...monthly, groupBy: "toUid", limit: 25 }),
      ]);

      const now = admin.firestore.FieldValue.serverTimestamp();

      await Promise.all([
        db
          .doc("rankings/broadcasters/daily/current")
          .set({ updatedAt: now, list: dailyList }),

        db
          .doc("rankings/broadcasters/weekly/current")
          .set({ updatedAt: now, list: weeklyList }),

        db
          .doc("rankings/broadcasters/monthly/current")
          .set({ updatedAt: now, list: monthlyList }),
      ]);

      console.log("✅ Broadcasters rankings updated successfully");
    } catch (err) {
      console.error("❌ Broadcasters ranking job error:", err);
    }
  }
);
