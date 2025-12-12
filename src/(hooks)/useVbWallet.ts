import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/firebaseConfig";

type WalletState = {
  vbBalance: number;
  vbTotalSent: number;
  vbTotalReceived: number;
};

export function useVbWallet() {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubWallet: (() => void) | null = null;

    unsubUser = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Kullanıcı çıkış yaptığında temizle
        setWallet(null);
        setLoadingWallet(false);
        setError(null);
        if (unsubWallet) unsubWallet();
        return;
      }

      setLoadingWallet(true);
      setError(null);

      const userRef = doc(db, "users", user.uid);

      // Daha önceki listener varsa kapat
      if (unsubWallet) unsubWallet();

      // Sadece CANLI OKUYUCU
      unsubWallet = onSnapshot(
        userRef,
        (snap) => {
          const d: any = snap.data() || {};

          setWallet({
            vbBalance: d.vbBalance ?? 0,
            vbTotalSent: d.vbTotalSent ?? 0,
            vbTotalReceived: d.vbTotalReceived ?? 0,
          });

          setLoadingWallet(false);
        },
        (err) => {
          console.error("useVbWallet snapshot error:", err);
          setError("Wallet okunamadı");
          setLoadingWallet(false);
        }
      );
    });

    return () => {
      if (unsubUser) unsubUser();
      if (unsubWallet) unsubWallet();
    };
  }, []);

  return {
    wallet,
    loadingWallet,
    error,
  };
}
