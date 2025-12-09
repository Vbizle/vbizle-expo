"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      setUser(u);

      const userRef = doc(db, "users", u.uid);
      const snap = await getDoc(userRef);

      const normalize = (d: any) => ({
        username: d?.username || u.displayName || "Misafir",
        avatar: d?.avatar || u.photoURL || "/user.png",
        vbId: d?.vbId || null,
      });

      if (!snap.exists()) {
        const def = normalize({});
        await setDoc(userRef, def);
        setProfile(def);
        setLoadingProfile(false);
        return;
      }

      const data = snap.data();
      const finalProfile = normalize(data);

      const patch: any = {};
      if (!data.username) patch.username = finalProfile.username;
      if (!data.avatar) patch.avatar = finalProfile.avatar;

      if (Object.keys(patch).length > 0) {
        await updateDoc(userRef, patch);
      }

      setProfile(finalProfile);
      setLoadingProfile(false);
    });

    return () => unsub();
  }, []);

  return { user, profile, loadingProfile };
}
