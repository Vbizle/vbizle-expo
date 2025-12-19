const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const { sendAppMessage } = require("../appMessages/appMessageEngine");

exports.sendRootAnnouncement = onCall(
  { region: "us-central1" },
  async ({ auth, data }) => {
    if (!auth?.uid) {
      throw new HttpsError("unauthenticated", "Auth gerekli");
    }

    const snap = await admin
      .firestore()
      .collection("users")
      .doc(auth.uid)
      .get();

    const user = snap.data();

    const allowed =
      user?.vbId === "VB-1" ||
      user?.role === "root" ||
      user?.roles?.root === true;

    if (!allowed) {
      throw new HttpsError("permission-denied", "Yetkisiz");
    }

    const { title, body, meta = {} } = data || {};

    if (!title || !body) {
      throw new HttpsError(
        "invalid-argument",
        "Başlık ve mesaj zorunlu"
      );
    }

   await sendAppMessage({
  toUid: "ALL",

  // 🔥 MUTLAKA SYSTEM
  category: "system",
  type: "system",

  // 🔥 AYIRT EDİCİ ALT TÜR
  subtype: "announcement",

  title,
  body,
  meta,
  pinned: true,
});
// 🔔 UI'NIN TEK DİNLEDİĞİ YER
const usersSnap = await admin.firestore().collection("users").get();
const batch = admin.firestore().batch();

usersSnap.docs.forEach((userDoc) => {
  const inboxRef = admin.firestore()
    .collection("systemInbox")
    .doc(userDoc.id);

 batch.set(
  inboxRef,
  {
    unreadCount: admin.firestore.FieldValue.increment(1),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);
});
await batch.commit();
    return { success: true };
  }
);
