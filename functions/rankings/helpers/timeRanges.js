const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

// 🇹🇷 SABİT ZAMAN DİLİMİ: TR
const TZ_OFFSET_MINUTES = 180; // UTC+3

function getNowTR() {
  const now = new Date();
  return new Date(now.getTime() + TZ_OFFSET_MINUTES * 60 * 1000);
}

function getTimeRange(type) {
  const nowTR = getNowTR();
  const start = new Date(nowTR);

  if (type === "daily") {
    start.setHours(0, 0, 0, 0);
  }

  if (type === "weekly") {
    // Pazartesi = 1
    const day = start.getDay() === 0 ? 7 : start.getDay();
    start.setDate(start.getDate() - (day - 1));
    start.setHours(0, 0, 0, 0);
  }

  if (type === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return {
    from: admin.firestore.Timestamp.fromDate(start),
    to: admin.firestore.Timestamp.fromDate(nowTR),
  };
}

module.exports = { getTimeRange };
