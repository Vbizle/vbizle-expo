const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

exports.expireInventoryItems = onSchedule(
  {
    schedule: "every 1 hours",
    region: "us-central1",
  },
  async () => {
    const now = admin.firestore.Timestamp.now();

    const usersSnap = await db.collection("users").get();
    const batch = db.batch();

    for (const userDoc of usersSnap.docs) {
      const userRef = userDoc.ref;

      // 🖼️ Avatar Frames
      const framesSnap = await userRef
        .collection("inventory_frames")
        .where("expiresAt", "<", now)
        .where("isActive", "==", true)
        .get();

      framesSnap.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
          isEquipped: false,
        });

        batch.update(userRef, {
          activeFrame: null,
        });
      });

      // ✨ Enter Effects
      const effectsSnap = await userRef
        .collection("inventory_enterEffects")
        .where("expiresAt", "<", now)
        .where("isActive", "==", true)
        .get();

      effectsSnap.forEach((doc) => {
        batch.update(doc.ref, {
          isActive: false,
        });
      });
    }

    await batch.commit();
    console.log("✅ Expired inventory items cleaned");
  }
);
