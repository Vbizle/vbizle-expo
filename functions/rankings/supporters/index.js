const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { getTimeRange } = require("../helpers/timeRanges");
const { aggregateGifts } = require("../helpers/aggregateGifts");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.supportersRankingJob = onSchedule(
  { schedule: "every 5 minutes", region: "us-central1" },
  async () => {
    try {
      const daily = getTimeRange("daily");
      const weekly = getTimeRange("weekly");
      const monthly = getTimeRange("monthly");

      const [dailyList, weeklyList, monthlyList] = await Promise.all([
        aggregateGifts({ ...daily, groupBy: "senderUid", limit: 25 }),
        aggregateGifts({ ...weekly, groupBy: "senderUid", limit: 25 }),
        aggregateGifts({ ...monthly, groupBy: "senderUid", limit: 25 }),
      ]);

      const now = admin.firestore.FieldValue.serverTimestamp();

      await Promise.all([
        db
          .doc("rankings/supporters/daily/current")
          .set({ updatedAt: now, list: dailyList }),

        db
          .doc("rankings/supporters/weekly/current")
          .set({ updatedAt: now, list: weeklyList }),

        db
          .doc("rankings/supporters/monthly/current")
          .set({ updatedAt: now, list: monthlyList }),
      ]);

      console.log("Supporters rankings updated successfully");
    } catch (err) {
      console.error("Supporters ranking job error:", err);
    }
  }
);
