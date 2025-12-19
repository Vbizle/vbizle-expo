const admin = require("firebase-admin");
const db = admin.firestore();

const SVP_LEVELS = {
  1: 10000,
  2: 20000,
  3: 40000,
  4: 75000,
  5: 125000,
};

const PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

function applyDecayIfNeeded(svp) {
  if (!svp || svp.level <= 0) return null;

  const now = Date.now();
  const last = svp.lastEvaluatedAt || 0;

  // 30 gün dolmamış → dokunma
  if (now - last < PERIOD_MS) return null;

  const newLevel = svp.level - 1;
  const newPoints = SVP_LEVELS[newLevel] || 0;

  return {
    level: newLevel,
    points: newPoints,
    lastEvaluatedAt: now,
  };
}

async function runSvpDecayForUser(uid) {
  const ref = db.collection("users").doc(uid);
  const snap = await ref.get();
  if (!snap.exists) return;

  const user = snap.data();
  const svp = user.svp;

  const decayed = applyDecayIfNeeded(svp);
  if (!decayed) return;

  await ref.update({
    svp: decayed,
    "roles.svip": decayed.level > 0,
  });

  console.log("🔻 SVP DECAY APPLIED", uid, decayed);
}

module.exports = {
  runSvpDecayForUser,
};
