import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase/firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

const SystemInboxContext = createContext<{ unread: number }>({ unread: 0 });

export function SystemInboxProvider({ children }: { children: React.ReactNode }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsub = onSnapshot(doc(db, "systemInbox", uid), (snap) => {
      setUnread(Number(snap.data()?.unreadCount || 0));
    });

    return () => unsub();
  }, []);

  return (
    <SystemInboxContext.Provider value={{ unread }}>
      {children}
    </SystemInboxContext.Provider>
  );
}

export function useSystemInbox() {
  return useContext(SystemInboxContext);
}
