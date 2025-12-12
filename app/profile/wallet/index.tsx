import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";

export default function WalletScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const [vbBalance, setVbBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function load() {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const d: any = snap.data();
        setVbBalance(d.vbBalance ?? 0);
      }
      setLoading(false);
    }

    load();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bakiyem</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.label}>Mevcut Bakiye</Text>
        <Text style={styles.balance}>{vbBalance} VB</Text>
      </View>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push("/profile/wallet/history")}
      >
        <Text style={styles.historyText}>Yükleme Geçmişim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F2F7",
  },
  loadingText: {
    fontSize: 16,
    color: "#444",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 20,
  },
  balanceCard: {
    width: "100%",
    backgroundColor: "#fff",
    paddingVertical: 30,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },
  label: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 5,
  },
  balance: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1C1C1E",
  },
  historyButton: {
    marginTop: 25,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  historyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
