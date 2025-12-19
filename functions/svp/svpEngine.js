const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const { sendAppMessage } =
  require("../appMessages/appMessageEngine");

const {
  vbLoaded,
  svpLevelUp,
} = require("../appMessages/messageTemplates");

const SVP_LEVELS = {
  1: 10000,
  2: 20000,
  3: 40000,
  4: 75000,
  5: 125000,
};

function getMonthKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function resolveLevelFromPoints(points) {
  let lvl = 0;
  for (const [level, min] of Object.entries(SVP_LEVELS)) {
    if (points >= min) lvl = Number(level);
  }
  return lvl;
}

async function evaluateSvp(uid, loadAmount = 0) {
  console.log("🔥 evaluateSvp", uid, loadAmount);

  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return;

  const user = snap.data();
  const svp = user.svp || { level: 0, points: 0 };
  const prevLevel = svp.level || 0; // ✅ EKLENDİ
  const nowMonth = getMonthKey();

  const points = (svp.points || 0) + loadAmount;
  let level = svp.level || 0;

  const qualifiedLevel = resolveLevelFromPoints(points);
  if (qualifiedLevel > level) {
    level = qualifiedLevel;
  }

  await ref.update({
  "svp.level": level,
  "svp.points": points,
  "svp.lastEvaluatedMonth": nowMonth,
   "svp.lastEvaluatedAt": admin.firestore.FieldValue.serverTimestamp(),
  "roles.svip": level > 0,
});
 // 🔔 SVP SEVİYE YÜKSELME MESAJI (SADECE ARTIŞTA)
  if (level > prevLevel) {
    await sendAppMessage({
      toUid: uid,
      ...svpLevelUp(level),
    });
  }
}

exports.onTransactionWrite = onDocumentCreated(
  {
    document: "transactions/{id}",
    region: "europe-west3", // Firestore eur3 ile uyumlu
  },
  async (event) => {
    console.log("🔥 onTransactionCreated fired");

    const data = event.data?.data();
    if (!data) return;
    if (data.type !== "vb_load") return;
    if (!data.toUid) return;

    await evaluateSvp(data.toUid, Number(data.amount || 0));
  }
);
exports.onDealerHistoryWrite = onDocumentCreated(
  {
    document: "dealerHistory/{dealerUid}/logs/{logId}",
    region: "europe-west3",
  },
  async (event) => {
    console.log("🔥 onDealerHistoryWrite fired");

    const data = event.data?.data();
    if (!data) return;

    const uid = data.userId;
    const amount = Number(data.amount || 0);

    if (!uid) return;
    if (amount <= 0) return;

    await evaluateSvp(uid, amount);
    // 🔔 BAYİ YÜKLEMESİ → SİSTEM MESAJI
    await sendAppMessage({
      toUid: uid,
      ...vbLoaded(amount),
    });
  }
);