// firebase/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------
// FIREBASE CONFIG → WEB İLE BİREBİR AYNI
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCItAB0IUES95OEUoCCCjI3Hib1usq1UnM",
  authDomain: "vbizle-f018f.firebaseapp.com",
  databaseURL:
    "https://vbizle-f018f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vbizle-f018f",

  // 🔥 ÖNEMLİ: BU AYNEN STORAGE EKRANINDAKİ İSİM
  storageBucket: "vbizle-f018f.firebasestorage.app",

  messagingSenderId: "559906574145",
  appId: "1:559906574145:web:da802868ae6ede79931bc0",
};

// ---------------------------------------------------------
// APP — Duplicate initialize ENGELİ
// ---------------------------------------------------------
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------
// AUTH — Expo için initializeAuth, yoksa getAuth
// ---------------------------------------------------------
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Firestore
export const db = getFirestore(app);

// Storage (bucket’ı özellikle verelim)
export const storage = getStorage(
  app,
  "gs://vbizle-f018f.firebasestorage.app"
);

// Auth export
export { auth };
