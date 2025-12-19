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
      category: "announcement",
      type: "root",
      title,
      body,
      meta,        // 🔥 KRİTİK: aynen geçir
      pinned: true,
    });

    return { success: true };
  }
);
