// app/profile/assets/index.tsx
import React, { useEffect, useState } from "react";
import {
    Alert, ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
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

export default function AssetsPage() {
  const user = auth.currentUser;
  const router = useRouter();

  const [tab, setTab] = useState<"convert" | "history">("convert");

  const [diamonds, setDiamonds] = useState(0);        // Elmas
  const [withdrawable, setWithdrawable] = useState(0); // Çekilebilir VB
  const [usdValue, setUsdValue] = useState(0);        // USD karşılığı

  const [manualInput, setManualInput] = useState("");

  const [history, setHistory] = useState<any[]>([]); // Gönderilen bağışlar

  // ==========================================================
  // KULLANICI VARLIKLARINI DİNAMİK ÇEK
  // ==========================================================
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users");
    const q = query(ref, where("__name__", "==", user.uid));

    const unsub = onSnapshot(q, (snap) => {
      snap.forEach((doc) => {
        const d: any = doc.data();

        setDiamonds(d.vbDiamonds || 0);
        setWithdrawable(d.vbWithdrawable || 0);

        const usd = (d.vbWithdrawable || 0) / 20000; // 20.000 VB → 1 USD
        setUsdValue(usd);
      });
    });

    return () => unsub();
  }, [user]);

  // ==========================================================
  // GEÇMİŞ: KİM BANA BAĞIŞ YAPTI?
  // ==========================================================
  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "transactions");
    const q = query(
      ref,
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

  // ==========================================================
  // BOZDURMA FONKSİYONU
  // ==========================================================
  function convertDiamonds(amount: number) {
    if (amount > diamonds) return Alert.alert("Vb", "Yeterli elmas yok!");

    // Elmas → VB dönüşüm
    const converted = Math.floor(amount / 2); // örneğin 5000 → 2500

    alert(
      `${amount} elmas başarıyla ${converted} VB olarak bakiyenize eklenecek (henüz backend yok)`
    );
  }

  function handleManualConvert() {
    const val = Number(manualInput);
    if (!val || val <= 0) return Alert.alert("Vb", "Geçerli bir sayı girin.");
    convertDiamonds(val);
    setManualInput("");
  }

  // ==========================================================
  // UI
  // ==========================================================
  return (
    <ScrollView style={styles.container}>
      {/* Geri */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ paddingVertical: 10 }}
      >
        <Text style={{ fontSize: 16 }}>← Geri</Text>
      </TouchableOpacity>

      {/* Sekmeler */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "convert" && styles.tabBtnActive]}
          onPress={() => setTab("convert")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "convert" && styles.tabTextActive,
            ]}
          >
            Bozdur
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === "history" && styles.tabBtnActive]}
          onPress={() => setTab("history")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "history" && styles.tabTextActive,
            ]}
          >
            Geçmiş
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===================== */}
      {/*     BOZDURMA          */}
      {/* ===================== */}
      {tab === "convert" && (
        <View>
          <Text style={styles.title}>Elmas: {diamonds}</Text>
          <Text style={styles.subTitle}>
            Çekilebilir Tutar: {withdrawable} VB
          </Text>
          <Text style={styles.subTitle}>USD Karşılığı: ${usdValue}</Text>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Hazır Bozdurma</Text>

            <TouchableOpacity
              style={styles.box}
              onPress={() => convertDiamonds(5000)}
            >
              <Text style={styles.boxText}>5000 Elmas → 2500 VB</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.box}
              onPress={() => convertDiamonds(10000)}
            >
              <Text style={styles.boxText}>10000 Elmas → 5000 VB</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Manuel Bozdurma</Text>

            <TextInput
              placeholder="Örn: 3000"
              value={manualInput}
              onChangeText={setManualInput}
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.convertBtn}
              onPress={handleManualConvert}
            >
              <Text style={styles.convertBtnText}>Dönüştür</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ===================== */}
      {/*       GEÇMİŞ          */}
      {/* ===================== */}
      {tab === "history" && (
        <View style={{ marginTop: 20 }}>
          {history.length === 0 ? (
            <Text style={{ fontSize: 16, opacity: 0.7 }}>
              Henüz kimse VB göndermemiş.
            </Text>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <Text style={styles.historyUser}>
                  {item.fromName || "Bilinmeyen"} → {item.amount} VB
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F7F8FA",
  },
  tabRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#DDD",
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#2563EB",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
  },
  tabTextActive: {
    color: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  box: {
    backgroundColor: "#EEE",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  boxText: {
    fontSize: 16,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  convertBtn: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  convertBtnText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  historyItem: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  historyUser: {
    fontSize: 16,
    fontWeight: "bold",
  },
  historyDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
});
