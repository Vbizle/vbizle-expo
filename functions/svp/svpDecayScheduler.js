const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
/* 🔔 YENİ: Sistem mesajları için */
const { sendAppMessage } =
  require("../appMessages/appMessageEngine");
const { svpExpiryWarning } =
  require("../appMessages/messageTemplates");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const SVP_LEVELS = {
  1: 10000,
  2: 20000,
  3: 40000,
  4: 75000,
  5: 125000,
};

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
/* ======================================================
   🔔 ADIM 2 — YENİ YARDIMCI SABİTLER & FONKSİYONLAR
   (MEVCUT KODA ETKİSİ YOK)
====================================================== */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function getDaysLeft(lastEvaluatedAt) {
  const expiresAt = lastEvaluatedAt + PERIOD_MS;
  return Math.ceil((expiresAt - Date.now()) / MS_PER_DAY);
}

function getDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

exports.runDailySvpDecay = onSchedule(
  {
    schedule: "every day 03:00",
    timeZone: "Europe/Istanbul",
    region: "us-central1",
  },
  async () => {
    console.log("⏳ SVP DAILY DECAY JOB STARTED");

    const now = Date.now();

    const snap = await db
      .collection("users")
      .where("svp.level", ">", 0)
      .get();

    if (snap.empty) {
      console.log("No SVP users found");
      return;
    }

    const batch = db.batch();
    let decayCount = 0;

    snap.docs.forEach((doc) => {
      const user = doc.data();
      const svp = user.svp;

      if (!svp || !svp.lastEvaluatedAt) return;
       /* ======================================================
         🔔 ADIM 3 — SVP 3 / 2 / 1 GÜN KALA UYARI MESAJLARI
         (DECAY ÖNCESİ, TEKRARSIZ)
      ====================================================== */
      const daysLeft = getDaysLeft(svp.lastEvaluatedAt);

      if ([3, 2, 1].includes(daysLeft)) {
        const todayKey = getDayKey();

        if (
          svp.lastWarningDay !== todayKey ||
          svp.lastWarningDaysLeft !== daysLeft
        ) {
          sendAppMessage({
            toUid: doc.id,
            ...svpExpiryWarning(daysLeft),
          });

          batch.update(doc.ref, {
            "svp.lastWarningDay": todayKey,
            "svp.lastWarningDaysLeft": daysLeft,
          });
        }
      }
      /* ===================== ADIM 3 SON ===================== */

      if (now - svp.lastEvaluatedAt < PERIOD_MS) return;

      const newLevel = svp.level - 1;
      if (newLevel < 0) return;

      const newPoints = SVP_LEVELS[newLevel] || 0;

      batch.update(doc.ref, {
        svp: {
          level: newLevel,
          points: newPoints,
          lastEvaluatedAt: now,
        },
        "roles.svip": newLevel > 0,
      });

      decayCount++;
    });

    if (decayCount > 0) {
      await batch.commit();
      console.log(`🔻 SVP DECAY APPLIED TO ${decayCount} USERS`);
    } else {
      console.log("No users required decay today");
    }
  }
);
