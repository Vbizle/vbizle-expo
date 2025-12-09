import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { db, auth } from "@/firebase/firebaseConfig";
import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import SendVbModal from "@/app/components/SendVbModal";
import { useVbWallet } from "@/src/(hooks)/useVbWallet";

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

  // 🔥 Firestore oda state dinleme
  useEffect(() => {
    const ref = doc(db, "rooms", roomId);

    const unsub = onSnapshot(ref, (snap) => {
      setState(snap.exists() ? snap.data() : null);
      setLoading(false);
    });

    return () => unsub();
  }, [roomId]);

  // 🔥 Owner profilini çek
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

  async function handleToggleBar() {
    if (!isOwner) return;
    await updateDoc(doc(db, "rooms", roomId), {
      donationBarEnabled: !state.donationBarEnabled,
    });
  }

  return (
    <View style={styles.wrapper}>

      {/* ÜST SATIR */}
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

      {/* DONATION BAR */}
      {state.donationBarEnabled && (
        <>
          {/* BAR ARKA PLAN */}
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${progress}%`,
                },
              ]}
            />
          </View>

          {/* ALT BİLGİ */}
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

      {/* SEND VB MODAL */}
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

  /* Donation bar */
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
    backgroundColor: "linear-gradient(90deg, #ff8a00, #ffc252, #008cff, #003c99, #7d003f, #ff005e)",
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
