import { auth, db } from "@/firebase/firebaseConfig";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { LOCATION_TASK_NAME } from "./locationTask";

/**
 * ♻️ Location task reset
 * Android cache’te yanlış "started" kalan task’ı temizler
 */
export async function resetLocationTask() {
  const started =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  console.log("♻️ resetLocationTask started:", started);

  if (started) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log("♻️ location task STOPPED");
  }
}

/**
 * 📍 Konum takibini başlatır
 * - İlk konumu anında Firestore'a yazar
 * - Sonra background task ile devam eder
 */
export async function startLocationTracking() {
  const uid = auth.currentUser?.uid;
  console.log("🚀 startLocationTracking CALLED", uid);

  if (!uid) {
    console.log("⛔ no uid, abort startLocationTracking");
    return false;
  }

  // --------------------------------------------------
  // 🟢 Ön plan izni
  // --------------------------------------------------
  const fg = await Location.requestForegroundPermissionsAsync();
  console.log("📍 foreground permission:", fg.status);
  if (fg.status !== "granted") return false;

  // --------------------------------------------------
  // 🟢 Arka plan izni
  // --------------------------------------------------
  const bg = await Location.requestBackgroundPermissionsAsync();
  console.log("📍 background permission:", bg.status);
  

  // --------------------------------------------------
  // 🔥 İLK KONUMU HEMEN AL VE YAZ (EN KRİTİK KISIM)
  // --------------------------------------------------
  try {
    console.log("🧪 BEFORE getCurrentPositionAsync");

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    console.log(
      "📍 initial foreground location:",
      current.coords.latitude,
      current.coords.longitude
    );

    await setDoc(
  doc(db, "users", uid),
  {
    location: {
      lat: current.coords.latitude,
      lng: current.coords.longitude,
      enabled: true,
      updatedAt: Date.now(),
    },
  },
  { merge: true }
);

    console.log("✅ initial location written to Firestore");
  } catch (err) {
    console.log("❌ initial location write failed", err);
  }

  // --------------------------------------------------
  // 🔄 Background task kontrolü
  // --------------------------------------------------
  const alreadyStarted =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  console.log("📡 alreadyStarted:", alreadyStarted);

  if (alreadyStarted) return true;

  // --------------------------------------------------
  // 🚀 Background location task başlat
  // --------------------------------------------------
  // 🔐 Background izin VAR MI kontrol et
const bgPerm = await Location.getBackgroundPermissionsAsync();

if (bgPerm.status === "granted") {
  await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
    accuracy: Location.Accuracy.Balanced,
    distanceInterval: 2500,        // 2.5 km
    timeInterval: 10 * 60 * 1000,  // 10 dk
    showsBackgroundLocationIndicator: false,

    // 🔥 TASK → UID AKTARIMI
    extras: { uid },
  });

  console.log("✅ Background location task STARTED");
} else {
  console.log(
    "⚠️ Background location NOT started (permission not granted)"
  );
}

// 🔴 ÖNEMLİ: fonksiyon ÇÖKMESİN, true dön
return true;

}

/**
 * ⛔ Konum takibini durdurur
 */
export async function stopLocationTracking() {
  const started =
    await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

  if (started) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    console.log("⛔ location task STOPPED manually");
  }
} 