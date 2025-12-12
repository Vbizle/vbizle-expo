import { auth, db } from "@/firebase/firebaseConfig";
import { getLevelInfo } from "@/src/utils/levelSystem";
import { getVipColor, getVipRank } from "@/src/utils/vipSystem";
import { doc, onSnapshot } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";

const UserLiveDataContext = createContext<any>(null);

export function UserLiveDataProvider({ children }: any) {
  const [liveUser, setLiveUser] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const refDoc = doc(db, "users", user.uid);

    const unsub = onSnapshot(refDoc, (snap) => {
      const d: any = snap.data() || {};

      const vipRank = getVipRank(d.vipScore ?? 0);
      const vipColor = getVipColor(vipRank);

      const levelInfo = getLevelInfo(d.vbTotalSent ?? 0);

      setLiveUser({
        ...d,
        vipRank,
        vipColor,
        levelInfo,
      });
    });

    return () => unsub();
  }, []);

  return (
    <UserLiveDataContext.Provider value={liveUser}>
      {children}
    </UserLiveDataContext.Provider>
  );
}

export const useLiveUser = () => useContext(UserLiveDataContext);
