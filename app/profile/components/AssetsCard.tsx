// app/profile/components/AssetsCard.tsx

import { auth, db } from "@/firebase/firebaseConfig";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  vbBalance: number;        // Kullanıcının VB bakiyesi
  vbDiamonds: number;       // Kullanıcının VB-Elmas bakiyesi
  onConvert: (amount: number) => void;  // Bozdurma fonksiyonu
};

export default function AssetsCard({ vbBalance, vbDiamonds, onConvert }: Props) {
  const [tab, setTab] = useState<"convert" | "history">("convert");
  const [donationHistory, setDonationHistory] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    // Kullanıcıya gelen bağışları çekiyoruz
    const q = query(
      collection(db, "transactions"),
      where("toUid", "==", user.uid),
      where("type", "==", "donation"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDonationHistory(list);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.card}>

      {/* Sekmeler */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab("convert")}
          style={[styles.tabBtn, tab === "convert" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "convert" && styles.tabTextActive]}>
            Bozdur
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("history")}
          style={[styles.tabBtn, tab === "history" && styles.tabActive]}
        >
          <Text style={[styles.tabText, tab === "history" && styles.tabTextActive]}>
            Geçmiş
          </Text>
        </TouchableOpacity>
      </View>

      {/* İçerik */}
      {tab === "convert" ? (
        <View style={styles.section}>
          <Text style={styles.label}>Mevcut Elmas</Text>
          <Text style={styles.value}>{vbDiamonds} ELMS</Text>

          <Text style={styles.info}>
            * 5000 elmas → 2500 VB olarak bozdurulur
          </Text>

          <TouchableOpacity
            style={styles.convertBtn}
            onPress={() => onConvert(5000)}
            disabled={vbDiamonds < 5000}
          >
            <Text style={styles.convertBtnText}>5000 ELİMAS BOZDUR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.historyList}>
          {donationHistory.length === 0 ? (
            <Text style={styles.empty}>Henüz bağış alınmamış.</Text>
          ) : (
            donationHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.histUser}>{item.fromName || "Bilinmeyen"}</Text>
                <Text style={styles.histAmount}>+{item.amount} VB</Text>
                <Text style={styles.histDate}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  tabRow: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },

  tabActive: {
    backgroundColor: "#2563EB",
  },

  tabText: {
    fontSize: 15,
    color: "#4B5563",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#fff",
  },

  section: {
    alignItems: "center",
  },

  label: {
    fontSize: 16,
    color: "#6B7280",
  },

  value: {
    fontSize: 32,
    fontWeight: "700",
    marginVertical: 10,
    color: "#111827",
  },

  info: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  convertBtn: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },

  convertBtnText: {
    color: "white",
    fontWeight: "700",
  },

  historyList: {
    maxHeight: 230,
  },

  empty: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },

  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },

  histUser: {
    fontSize: 15,
    fontWeight: "600",
  },

  histAmount: {
    fontSize: 16,
    color: "#10B981",
    marginTop: 3,
  },

  histDate: {
    fontSize: 12,
    color: "#6B7280",
  },
});
