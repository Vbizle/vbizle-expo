// firebase/firebaseConfig.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// ---------------------------------------------------------
// FIREBASE CONFIG
// ---------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCItAB0IUES95OEUoCCCjI3Hib1usq1UnM",
  authDomain: "vbizle-f018f.firebaseapp.com",
  databaseURL:
    "https://vbizle-f018f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vbizle-f018f",
  storageBucket: "vbizle-f018f.firebasestorage.app",
  messagingSenderId: "559906574145",
  appId: "1:559906574145:web:da802868ae6ede79931bc0",
};

// ---------------------------------------------------------
// APP INIT
// ---------------------------------------------------------
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ---------------------------------------------------------
// AUTH INIT
// ---------------------------------------------------------
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };

// ---------------------------------------------------------
// FIRESTORE
// ---------------------------------------------------------
export const db = getFirestore(app);

// ---------------------------------------------------------
// STORAGE
// ---------------------------------------------------------
export const storage = getStorage(app);

// ---------------------------------------------------------
// FUNCTIONS — RN/Expo için Token PATCH ZORUNLU
// ---------------------------------------------------------
export const functions = getFunctions(app, "us-central1");

// Expo / RN ortamında token otomatik eklenmediği için MANUEL ekliyoruz
functions.customFetch = async (url, options = {}) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (err) {
    console.log("customFetch Token Error:", err);
  }

  return fetch(url, options);
};
