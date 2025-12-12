// core/helpers.js
require("./init");                      // initializeApp her zaman ilk yüklenir
const admin = require("firebase-admin");
const db = admin.firestore();

/* ============================================================
   ROLE HELPERS
============================================================ */
async function getUserRole(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return "user";
  return snap.data().role || "user";
}

const isRoot = (role) => role === "root";
const isAdmin = (role) => role === "admin" || role === "root";

/* ============================================================
   USER SHORT INFO
============================================================ */
async function getUserShort(uid) {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return null;

  const d = snap.data();
  return {
    uid,
    username: d.username || "Kullanıcı",
    avatar:
      d.avatar ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    role: d.role || "user",
  };
}

/* ============================================================
   LOAD HISTORY MOTORU — LOG EKLENDİ
============================================================ */
async function addHistory(entry) {
  try {
    console.log("ADD_HISTORY_START", entry);

    const ref = await db.collection("loadHistory").add({
      ...entry,
      createdAt: Date.now(),
    });

    console.log("ADD_HISTORY_SUCCESS", {
      id: ref.id,
      ...entry,
    });

    return ref;
  } catch (err) {
    console.error("ADD_HISTORY_ERROR", err);
    throw err;
  }
}

module.exports = {
  db,
  getUserRole,
  getUserShort,
  isRoot,
  isAdmin,
  addHistory,
};
