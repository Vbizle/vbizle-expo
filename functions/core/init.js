// core/init.js
const admin = require("firebase-admin");

if (!admin.apps.length) {
  console.log("INIT_FIREBASE_ADMIN: initializing default app");
  admin.initializeApp();
} else {
  console.log("INIT_FIREBASE_ADMIN: already initialized");
}

module.exports = admin;
