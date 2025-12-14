import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { auth } from "@/firebase/firebaseConfig";

type Props = {
  item: any;
  onApproved?: () => void;
  onRejected?: () => void;
};

export default function WithdrawCard({ item, onApproved, onRejected }: Props) {
  const [loading, setLoading] = useState(false);

  async function callAdminFunction(type: "approve" | "reject") {
    if (loading) return;

    setLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();

      const url =
        type === "approve"
          ? "https://us-central1-vbizle-f018f.cloudfunctions.net/approveWithdrawRequest"
          : "https://us-central1-vbizle-f018f.cloudfunctions.net/rejectWithdrawRequest";

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: item.id,
        }),
      });

      // ✅ UI callback
      type === "approve" ? onApproved?.() : onRejected?.();
    } catch (e) {
      console.log("WITHDRAW_ACTION_ERROR", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.user}>
            {item.username} ({item.vbId})
          </Text>
          <Text style={styles.amount}>💎 {item.diamondAmount}</Text>
        </View>
      </View>

      <Text>Ad Soyad: {item.fullName}</Text>
      <Text>Banka: {item.bankName}</Text>
      <Text>IBAN: {item.iban}</Text>
      <Text style={styles.date}>
        {item.createdAt?.toDate?.().toLocaleString()}
      </Text>

      {item.status === "pending" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.approve]}
            onPress={() => callAdminFunction("approve")}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Onayla</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.reject]}
            onPress={() => callAdminFunction("reject")}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>İptal Et</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  row: { flexDirection: "row", marginBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  user: { fontWeight: "700" },
  amount: { color: "#2563eb", fontWeight: "600" },
  date: { marginTop: 6, color: "#666", fontSize: 12 },
  actions: { flexDirection: "row", marginTop: 12, gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  approve: { backgroundColor: "#16a34a" },
  reject: { backgroundColor: "#dc2626" },
  btnText: { color: "#fff", fontWeight: "600" },
});
