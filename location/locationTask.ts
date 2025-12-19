import { db } from "@/firebase/firebaseConfig";
import * as TaskManager from "expo-task-manager";
import { doc, updateDoc } from "firebase/firestore";

export const LOCATION_TASK_NAME = "background-location-task";

console.log("🚀 [LOCATION TASK] REGISTERED");

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log("❌ [LOCATION TASK] error", error);
    return;
  }

  if (!data) {
    console.log("⛔ [LOCATION TASK] no data");
    return;
  }

  const { locations, extras } = data as any;
  const loc = locations?.[0];

  if (!loc) {
    console.log("⛔ [LOCATION TASK] no location");
    return;
  }

  const { latitude, longitude } = loc.coords;
  const uid = extras?.uid;

  console.log("📍 [LOCATION TASK] write", {
    uid,
    latitude,
    longitude,
  });

  if (!uid) {
    console.log("⛔ [LOCATION TASK] uid missing");
    return;
  }

  await updateDoc(doc(db, "users", uid), {
    location: {
      lat: latitude,
      lng: longitude,
      enabled: true,
      updatedAt: Date.now(),
    },
  });

  console.log("✅ [LOCATION TASK] Firestore updated");
});
