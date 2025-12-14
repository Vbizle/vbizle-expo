import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { useRouter } from "expo-router";

import ConvertTab from "./components/ConvertTab";
import DiamondsTab from "./components/DiamondsTab";
import HistoryTab from "./components/HistoryTab";

export default function AssetsPage() {
  const user = auth.currentUser;
  const router = useRouter();

  const [tab, setTab] = useState<"diamonds" | "convert" | "history">("diamonds");

  const [diamonds, setDiamonds] = useState(0);
  const [withdrawable, setWithdrawable] = useState(0);
  const [usdValue, setUsdValue] = useState(0);

  const [manualInput, setManualInput] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  const PRESETS = [5000, 25000, 50000, 100000, 250000, 500000];

  // ================= VARLIKLAR =================
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users"),
      where("__name__", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      snap.forEach((doc) => {
        const d: any = doc.data();
        setDiamonds(d.vbDiamonds || 0);
        setWithdrawable(d.vbWithdrawable || 0);
        setUsdValue((d.vbWithdrawable || 0) / 20000);
      });
    });

    return () => unsub();
  }, [user]);

  // ================= GEÇMİŞ =================
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("toUid", "==", user.uid),
      where("type", "==", "gift"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const arr: any[] = [];
      snap.forEach((doc) => arr.push({ id: doc.id, ...doc.data() }));
      setHistory(arr);
    });

    return () => unsub();
  }, [user]);

  // ================= BOZDUR (ŞİMDİLİK MOCK) =================
  function convertDiamonds(amount: number) {
    if (amount > diamonds) {
      return Alert.alert("Vb", "Yeterli elmas yok!");
    }

    const converted = Math.floor(amount / 2);
    Alert.alert(
      "Bozdurma",
      `${amount} elmas → ${converted} VB (backend henüz yok)`
    );
  }

  function handleManualConvert() {
    const val = Number(manualInput);
    if (!val || val <= 0) {
      return Alert.alert("Vb", "Geçerli bir sayı girin.");
    }
    convertDiamonds(val);
    setManualInput("");
  }

  // ================= UI =================
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 10 }}>
        <Text style={{ fontSize: 16 }}>← Geri</Text>
      </TouchableOpacity>

      {/* TAB BAR */}
      <View style={styles.tabRow}>
        {[
          { key: "diamonds", label: "Elmaslarım" },
          { key: "convert", label: "Bozdur" },
          { key: "history", label: "Geçmiş" },
        ].map((t: any) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Text
              style={[
                styles.tabText,
                tab === t.key && styles.tabTextActive,
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

     {tab === "diamonds" && (
  <DiamondsTab
    diamondBalance={diamonds}
    styles={styles}
  />
)}

      {tab === "convert" && (
        <ConvertTab diamonds={diamonds} styles={styles} />
      )}

      {tab === "history" && (
        <HistoryTab history={history} styles={styles} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#F7F8FA" },
  tabRow: { flexDirection: "row", marginVertical: 10 },
  tabBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#DDD",
    alignItems: "center",
    marginHorizontal: 2,
  },
  tabBtnActive: { backgroundColor: "#2563EB" },
  tabText: { fontWeight: "700", color: "#444" },
  tabTextActive: { color: "#fff" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 10 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  preset: {
    width: "30%",
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  presetText: { fontWeight: "700" },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    marginTop: 10,
  },
  convertBtn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  convertBtnText: { color: "#fff", fontWeight: "700" },
  historyItem: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyUser: { fontWeight: "700" },
  historyDate: { fontSize: 12, opacity: 0.6, marginTop: 4 },
});
