import { auth } from "@/firebase/firebaseConfig";
import {
    getUserPremiumStatus,
    setPremiumActive,
    setPremiumHideIdentity,
} from "@/src/premium/premiumService";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import StatusCard from "./StatusCard";

export default function StatusTab() {
  const uid = auth.currentUser?.uid;
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    getUserPremiumStatus(uid).then((res) => {
      setStatus(res);
      setLoading(false);
    });
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!status) {
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
          setStatus({ ...status, hideRealIdentity: v });
          setPremiumHideIdentity(uid!, v);
        }}
      />
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
});
