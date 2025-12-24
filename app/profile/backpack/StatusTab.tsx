import { auth, db } from "@/firebase/firebaseConfig";
import {
  getUserPremiumStatus,
  setPremiumActive,
  setPremiumHideIdentity,
} from "@/src/premium/premiumService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import StatusCard from "./StatusCard";

// 🖼️ FRAME SERVİSLERİ (ZATEN VAR OLAN)
import {
  setFrameActive,
  setFrameHideInLists,
} from "@/src/market-items/services/frameInventoryService";

// 🔥 FIRESTORE
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function StatusTab() {
  const uid = auth.currentUser?.uid;

  // 👑 KRALLIK / PREMIUM (ESKİ – DOKUNULMADI)
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 🖼️ FRAME INVENTORY (YENİ)
  const [frames, setFrames] = useState<any[]>([]);

  // 👑 Premium status
  useEffect(() => {
    if (!uid) return;
    getUserPremiumStatus(uid).then((res) => {
      setStatus(res);
      setLoading(false);
    });
  }, [uid]);

  // 🖼️ Avatar frame’ler
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "inventory_frames"),
      orderBy("expiresAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setFrames(list);
    });

    return () => unsub();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!status && frames.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>
          Aktif bir statünüz bulunmuyor
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {/* 👑 KRALLIK / PREMIUM — AYNEN KALDI */}
      {status && (
        <StatusCard
          title={
            status.type === "kingdom"
              ? "Krallık"
              : status.type
          }
          expiresAt={status.expiresAt?.toMillis?.()}
          isActive={status.isActive}
          hideInLists={status.hideRealIdentity}
          onToggleActive={(v) => {
            setStatus({ ...status, isActive: v });
            setPremiumActive(uid!, v);
          }}
          onToggleHide={(v) => {
            setStatus({
              ...status,
              hideRealIdentity: v,
            });
            setPremiumHideIdentity(uid!, v);
          }}
        />
      )}

      {/* 🖼️ AVATAR ÇERÇEVELERİ — YENİ EKLENDİ */}
      {frames.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            🖼️ Avatar Çerçeveleri
          </Text>

          {frames.map((frame) => (
            <StatusCard
              key={frame.id}
              title={frame.title}
              expiresAt={frame.expiresAt?.toMillis?.()}
              isActive={frame.isActive}
              hideInLists={frame.hideInLists}
              onToggleActive={(v) =>
                setFrameActive(frame.id, v)
              }
              onToggleHide={(v) =>
                setFrameHideInLists(frame.id, v)
              }
            />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  empty: {
    fontSize: 14,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginTop: 16,
    marginBottom: 6,
  },
});
