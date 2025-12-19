const admin = require("firebase-admin");
const db = admin.firestore();

/* 🔔 YENİ: SYSTEM DM YAZICI (EK) */
const {
  writeSystemDmMessage,
} = require("../systemDm/systemDmWriter");

/**
 * TEK VE ZORUNLU MESAJ GİRİŞ NOKTASI
 * Uygulama içi tüm sistem mesajları buradan geçer
 */
async function sendAppMessage({
  toUid, // string | "ALL"
  category, // wallet | svp | system | announcement
  type, // vb_loaded | svp_up | svp_warning | admin_notice ...
  title,
  body,
  meta = {},
  pinned = false,
}) {
  if (!toUid || !category || !type || !title || !body) {
    throw new Error("sendAppMessage: eksik parametre");
  }

  /* ==============================
     1️⃣ ESKİ DAVRANIŞ (AYNEN KORUNUR)
  ============================== */
  await db.collection("appMessages").add({
    toUid,
    category,
    type,
    title,
    body,
    meta,
    pinned,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  /* ==============================
     2️⃣ YENİ DAVRANIŞ (SYSTEM DM)
     → VbTeam / Sistem sohbeti
  ============================== */
  await writeSystemDmMessage({
    toUid,
    category,
    type,
    title,
    body,
    meta,
    pinned,
  });
}

module.exports = {
  sendAppMessage,
};
