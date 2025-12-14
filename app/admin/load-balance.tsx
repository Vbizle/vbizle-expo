import { auth, db } from "@/firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { walletEngine } from "@/src/services/walletEngine";
import AdminButton from "./components/AdminButton";
import AdminCard from "./components/AdminCard";
import LoadHistoryRow from "./components/LoadHistoryRow";
import LoadHistoryTabs from "./components/LoadHistoryTabs";
import UserPreviewCard from "./components/UserPreviewCard";
import useLoadHistory from "./hooks/useLoadHistory";

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function LoadBalanceScreen() {
  const [vbId, setVbId] = useState("");
  const [amount, setAmount] = useState("");

  const [me, setMe] = useState<any>(null);
  const [myData, setMyData] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const [preview, setPreview] = useState<any>(null);
  const [fetching, setFetching] = useState(false);
  const [loading, setLoading] = useState(false);

  const [historyTab, setHistoryTab] =
    useState<"vb" | "dealer">("vb");

  const { history, historyLoading, loadHistory, resetHistory } =
    useLoadHistory({
      fallbackAvatar: FALLBACK_AVATAR,
      historyTab,
    });

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setMe(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) setMyData(snap.data());
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  /* ================= VB-ID SEARCH ================= */
  useEffect(() => {
    if (!vbId.trim()) {
      setPreview(null);
      resetHistory();
      return;
    }

    const t = setTimeout(() => {
      findUserByVbId(vbId.trim().toUpperCase());
    }, 400);

    return () => clearTimeout(t);
  }, [vbId, historyTab]);

  async function findUserByVbId(vbId: string) {
    try {
      setFetching(true);

      const q = query(
        collection(db, "users"),
        where("vbId", "==", vbId)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setPreview({ notFound: true });
        resetHistory();
        return;
      }

      const u = snap.docs[0];
      const d = u.data();

      setPreview({
        uid: u.id,
        username: d.username,
        avatar: d.avatar ?? FALLBACK_AVATAR,
        role: d.role || "user",
        vbId: d.vbId,
        isDealer: d.isDealer === true,
        dealerWallet: d.dealerWallet ?? 0,
        vbBalance: d.vbBalance ?? 0,
      });

      await loadHistory(d.vbId);
    } finally {
      setFetching(false);
    }
  }

  /* ================= NORMAL VB LOAD ================= */
  async function submitNormalLoad() {
    if (loading) return;
    setLoading(true);

    try {
      const clean = vbId.trim().toUpperCase();
      const amt = Number(amount);
      if (!clean || !amt || amt <= 0) {
        Alert.alert("Hata", "Geçersiz bilgi.");
        return;
      }

      await walletEngine.adminLoadByVbId({
        toVbId: clean,
        amount: amt,
        source: myData?.role === "dealer" ? "dealer" : "root",
      });

      setAmount("");
      await loadHistory(clean);
      Alert.alert("Başarılı", `${amt} VB yüklendi.`);
    } finally {
      setLoading(false);
    }
  }

  /* ================= DEALER WALLET LOAD ================= */
  async function submitDealerWalletLoad() {
    if (!preview?.isDealer) {
      Alert.alert("Uyarı", "Bu kullanıcı bayi değil.");
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert("Hata", "Geçerli miktar girin.");
      return;
    }

    try {
      await updateDoc(doc(db, "users", preview.uid), {
        dealerWallet: (preview.dealerWallet ?? 0) + amt,
      });

      await addDoc(collection(db, "loadHistory"), {
        type: "dealer_wallet_load",
        source: "root_dealer",
        admin: {
          uid: me.uid,
          username: myData?.username ?? "Root",
          avatar: myData?.avatar ?? null,
          role: "root",
        },
        toUid: preview.uid,
        toVbId: preview.vbId,
        amount: amt,
        createdAt: new Date(), // 🔥 KRİTİK
      });

      setAmount("");
      await loadHistory(preview.vbId);
      Alert.alert("Başarılı", "Bayi cüzdanına bakiye yüklendi.");
    } catch {
      Alert.alert("Hata", "İşlem yapılamadı.");
    }
  }

  /* ================= RENDER ================= */
  return (
    <View style={styles.container}>
      <AdminCard title="VB Bakiye Yönetimi">
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı VB-ID"
          value={vbId}
          onChangeText={setVbId}
        />

        {fetching && <ActivityIndicator color="#7c3aed" />}

        <UserPreviewCard preview={preview} myData={myData} styles={styles} />

        <TextInput
          style={styles.input}
          placeholder="Yükleme miktarı"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <View style={{ flexDirection: "row", gap: 10 }}>
  <View style={{ flex: 1 }}>
    <AdminButton
      title="VB Bakiye Yükle"
      onPress={submitNormalLoad}
      disabled={loading}
    />
  </View>

  <View style={{ flex: 1 }}>
    <AdminButton
      title="Bakiye Eksilt"
      onPress={async () => {
  try {
    const amt = Number(amount);

    if (!preview?.uid || !amt || amt <= 0) {
      Alert.alert("Hata", "Geçerli miktar girin.");
      return;
    }

    await walletEngine.rootDecreaseUserBalance({
      toUid: preview.uid,
      amount: amt,
    });

    setAmount("");
    await loadHistory(preview.vbId);

    Alert.alert("Başarılı", "Kullanıcı bakiyesi eksiltildi.");
  } catch (e: any) {
    Alert.alert("Hata", e.message || "İşlem başarısız.");
  }
}}
      variant="danger"
    />
  </View>
</View>

       {myData?.role === "root" && preview?.isDealer && (
  <View style={{ flexDirection: "row", gap: 10 }}>
    <View style={{ flex: 1 }}>
      <AdminButton
        title="Bayi Cüzdanına VB Yükle"
        onPress={submitDealerWalletLoad}
      />
    </View>

    <View style={{ flex: 1 }}>
      <AdminButton
        title="Bayi Bakiye Eksilt"
        variant="danger"
        onPress={async () => {
          try {
            const amt = Number(amount);

            if (!preview?.uid || !amt || amt <= 0) {
              Alert.alert("Hata", "Geçerli miktar girin.");
              return;
            }

            await walletEngine.rootDecreaseDealerWallet({
              toUid: preview.uid,
              amount: amt,
            });

            setAmount("");
            await loadHistory(preview.vbId);

            Alert.alert("Başarılı", "Bayi bakiyesi eksiltildi.");
          } catch (e: any) {
            Alert.alert("Hata", e.message || "İşlem başarısız.");
          }
        }}
      />
    </View>
  </View>
)}


        <LoadHistoryTabs value={historyTab} onChange={setHistoryTab} />

        {historyLoading && <ActivityIndicator color="#7c3aed" />}

        {/* ✅ HER İKİ SEKME DE SCROLL */}
        <ScrollView
          style={{ maxHeight: 320 }}
          nestedScrollEnabled
          showsVerticalScrollIndicator
        >
          {history.map((h) => (
            <LoadHistoryRow key={h.id} item={h} />
          ))}
        </ScrollView>
      </AdminCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    backgroundColor: "#ECECEC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
});
