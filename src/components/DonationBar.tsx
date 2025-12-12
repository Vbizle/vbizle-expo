import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

import SendVbModal from "@/app/components/SendVbModal";
import { useVbWallet } from "@/src/(hooks)/useVbWallet";
import { walletEngine } from "@/src/services/walletEngine";

type Props = {
  roomId: string;
};

export default function DonationBar({ roomId }: Props) {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { wallet } = useVbWallet();
  const user = auth.currentUser;

  const [showSend, setShowSend] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  const isOwner = user && state?.ownerId === user.uid;

  // Oda state dinleyici
  useEffect(() => {
    const ref = doc(db, "rooms", roomId);
    const unsub = onSnapshot(ref, (snap) => {
      setState(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
    return () => unsub();
  }, [roomId]);

  // Oda sahibini yükle
  useEffect(() => {
    async function loadOwner() {
      if (!state?.ownerId) return;
      const ref = doc(db, "users", state.ownerId);
      const snap = await getDoc(ref);
      if (snap.exists()) setOwnerProfile(snap.data());
    }
    loadOwner();
  }, [state?.ownerId]);

  if (loading || !state) return null;
  if (!state.donationBarEnabled && !isOwner) return null;

  const title = state.donationTitle || "1. Koltuk için bağış hedefi";
  const target = state.donationTarget ?? 1000;
  const current = state.donationCurrent ?? 0;

  const progress = Math.min(100, (current / target) * 100 || 0);

  // Oda sahibi bağış barını aç/kapat (güvenli engine versiyonu)
  async function handleToggleBar() {
    if (!isOwner || !user) return;
    try {
      await walletEngine.toggleDonationBar(roomId, user.uid);
    } catch (err) {
      console.log("Donation toggle error:", err);
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* Üst Satır */}
      <View style={styles.topRow}>
        <Text style={styles.title}>🎁 {title}</Text>

        {isOwner && (
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={handleToggleBar}
          >
            <Text style={styles.toggleBtnText}>
              {state.donationBarEnabled ? "Kapat" : "Aç"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bağış Barı */}
      {state.donationBarEnabled && (
        <>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          {/* Alt Bilgi */}
          <View style={styles.bottomRow}>
            <Text style={styles.currentText}>
              {current} / {target} Vb
            </Text>

            <TouchableOpacity
              onPress={() => setShowSend(true)}
              style={styles.donateBtn}
            >
              <Text style={styles.donateBtnText}>Bağış Yap</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* SendVbModal */}
      {showSend && (
        <SendVbModal
          visible={showSend}
          onClose={() => setShowSend(false)}
          toUser={{
            uid: state.ownerId!,
            name: ownerProfile?.username || "Host",
            avatar: ownerProfile?.avatar || null,
          }}
          roomId={roomId}
          currentBalance={wallet?.vbBalance ?? 0}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: "#d8b4fe",
    fontWeight: "600",
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#6d28d9",
  },
  toggleBtnText: {
    color: "white",
    fontSize: 12,
  },
  barBg: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginBottom: 6,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor:
      "linear-gradient(90deg, #ff8a00, #ffc252, #008cff, #003c99, #7d003f, #ff005e)",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentText: {
    fontSize: 13,
    color: "#d1d5db",
  },
  donateBtn: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 999,
  },
  donateBtnText: {
    fontSize: 12,
    color: "white",
  },
});
