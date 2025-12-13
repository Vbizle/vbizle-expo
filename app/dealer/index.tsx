// app/dealer/index.tsx

import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DealerScreen() {
  const router = useRouter();

  const [me, setMe] = useState<any>(null);
  const [myData, setMyData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [dealerRevoked, setDealerRevoked] = useState(false);

  const [vbId, setVbId] = useState("");
  const [amount, setAmount] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [history10, setHistory10] = useState<any[]>([]);
  const [historyAll, setHistoryAll] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [activeTab, setActiveTab] = useState<"dealer" | "root">("dealer");
  const [rootHistory, setRootHistory] = useState<any[]>([]);

  // =======================
  // VB FORMATTER (BIN / MILYON AYRIMI)
  // =======================
  function formatVB(value: number) {
    return new Intl.NumberFormat("tr-TR", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  // =======================
  // useEffect'ler ve diğer fonksiyonlar aşağıda
  // =======================


  // =======================
  // AUTH + BAYİ KONTROLÜ
  // =======================
  useEffect(() => {
    let unsubUser: any = null;

    const unsub = auth.onAuthStateChanged(async (u) => {
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      if (u) {
        setMe(u);

        const ref = doc(db, "users", u.uid);

        unsubUser = onSnapshot(ref, async (snap) => {
          if (!snap.exists()) {
            Alert.alert("Hata", "Kullanıcı bulunamadı.");
            return;
          }

          const d = snap.data();
          setMyData(d);

          if (!d.isDealer) {
            setDealerRevoked(true);
            return;
          }

          if (dealerRevoked) setDealerRevoked(false);

          loadLast10Logs(u.uid);
          loadRootLogs(u.uid);
        });
      }

      setLoadingUser(false);
    });

    return () => {
      if (unsubUser) unsubUser();
      unsub();
    };
  }, [dealerRevoked]);

  // =======================
  // Kullanıcı Ara (VB-ID)
  // =======================
  async function findUser(v?: string) {
    if (dealerRevoked) return;

    const value = (v ?? vbId).trim();

    if (!value) {
      setPreview(null);
      return;
    }

    try {
      setSearchLoading(true);

      const q = query(
        collection(db, "users"),
        where("vbId", "==", value.toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setPreview({ notFound: true });
      } else {
        const data = snap.docs[0].data();
        setPreview({
          uid: snap.docs[0].id,
          username: data.username,
          avatar: data.avatar,
          role: data.role ?? "user",
          vbId: data.vbId,
          vbBalance: data.vbBalance ?? 0,
        });
      }
    } catch {
      Alert.alert("Hata", "Kullanıcı aranamadı.");
    }

    setSearchLoading(false);
  }

  // =======================
  // BAYİ → BAKİYE YÜKLEME
  // =======================
  async function submit() {
    if (dealerRevoked) return;
    if (!preview?.uid || preview.notFound) return;
    if (submitLoading) return;

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert("Hata", "Geçerli miktar girin.");
      return;
    }

    const dealerBalance = myData?.dealerWallet ?? 0;
    if (amt > dealerBalance) {
      Alert.alert(
        "Yetersiz Bakiye",
        `Mevcut bayi bakiyeniz: ${dealerBalance} VB\nRoot'tan yeni bakiye yükletmeniz gerekiyor.`
      );
      return;
    }

    try {
      setSubmitLoading(true);

      await updateDoc(doc(db, "users", preview.uid), {
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      await updateDoc(doc(db, "users", me.uid), {
        dealerWallet: dealerBalance - amt,
      });

      await addDoc(collection(db, "dealerHistory", me.uid, "logs"), {
        userId: preview.uid,
        username: preview.username,
        avatar: preview.avatar,
        amount: amt,
        date: Date.now(),
      });

      await addDoc(collection(db, "loadHistory"), {
        type: "dealer_load",
        source: "dealer",
        admin: {
          uid: me.uid,
          username: myData?.username ?? "Bayi",
          avatar: myData?.avatar ?? null,
          role: "dealer",
        },
        toUid: preview.uid,
        toVbId: preview.vbId,
        amount: amt,
        createdAt: Date.now(),
      });

      Alert.alert("Başarılı", `${amt} VB yüklendi.`);

      setPreview({
        ...preview,
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      setMyData({
        ...myData,
        dealerWallet: dealerBalance - amt,
      });

      loadLast10Logs(me.uid);

      setAmount("");
    } catch {
      Alert.alert("Hata", "İşlem gerçekleştirilemedi.");
    }

    setSubmitLoading(false);
  }

  // =======================
  // SON 10 LOG (BAYİ)
  // =======================
  async function loadLast10Logs(uid: string) {
    const q = query(
      collection(db, "dealerHistory", uid, "logs"),
      orderBy("date", "desc"),
      limit(10)
    );

    const snap = await getDocs(q);
    setHistory10(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  // =======================
  // ROOT → BAYİ YÜKLEMELERİ
  // =======================
  async function loadRootLogs(uid: string) {
    const q = query(
      collection(db, "loadHistory"),
      where("toUid", "==", uid),
      where("type", "==", "dealer_wallet_load"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const snap = await getDocs(q);
    setRootHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  // =======================
  // TÜM LOG LİSTESİ
  // =======================
  async function loadAllLogs() {
    if (dealerRevoked) return;

    const q = query(
      collection(db, "dealerHistory", me.uid, "logs"),
      orderBy("date", "desc")
    );

    const snap = await getDocs(q);
    setHistoryAll(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setModalVisible(true);
  }

  // =======================
  // RENDER
  // =======================
  if (loadingUser) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (dealerRevoked) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#b91c1c", fontWeight: "700", fontSize: 16 }}>
          Bayiniz kapatılmıştır. İyi günler dileriz.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
  <View style={styles.headerRow}>
    <View style={styles.tabs}>
      <TouchableOpacity
        style={[styles.tab, activeTab === "dealer" && styles.tabActive]}
        onPress={() => setActiveTab("dealer")}
      >
        <Text>Yüklemelerim</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === "root" && styles.tabActive]}
        onPress={() => setActiveTab("root")}
      >
        <Text>Satın Alımlarım</Text>
      </TouchableOpacity>
    </View>

   <Text style={styles.dealerBalance}>
  Bayi Bakiye: {formatVB(myData?.dealerWallet ?? 0)} VB
</Text>
  </View>

      {activeTab === "dealer" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı ID (örn: Vb-1)"
            value={vbId}
            onChangeText={(text) => {
              setVbId(text);
              findUser(text);
            }}
          />

          {searchLoading && <ActivityIndicator color="#7c3aed" />}

          {preview?.notFound && (
            <Text style={{ color: "#b91c1c", marginTop: 10 }}>
              Kullanıcı bulunamadı
            </Text>
          )}

          {preview && !preview.notFound && (
            <View style={styles.previewCard}>
              <Image source={{ uri: preview.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.username}>{preview.username}</Text>
                <Text style={styles.role}>{preview.role}</Text>
              </View>
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Yüklenecek miktar"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={submit}
            disabled={submitLoading}
          >
            <Text style={styles.btnText}>
              {submitLoading ? "Gönderiliyor..." : "Bakiye Yükle"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.historyTitle}>Son İşlemler</Text>

          <FlatList
            data={history10}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <Image source={{ uri: item.avatar }} style={styles.logAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logName}>{item.username}</Text>
                  <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
                </View>
                <Text style={styles.logDate}>
                  {new Date(item.date).toLocaleString("tr-TR")}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity style={styles.moreBtn} onPress={loadAllLogs}>
            <Text style={styles.moreText}>Daha Fazla Gör</Text>
          </TouchableOpacity>
        </>
      )}

      {activeTab === "root" && (
  <FlatList
    data={rootHistory}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => {
      const date =
        typeof item.createdAt === "number"
          ? new Date(item.createdAt)
          : item.createdAt?.toDate?.();

     return (
  <View style={styles.logItem}>
    <Image
      source={{
        uri:
          item.admin?.avatar ||
          item.avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      }}
      style={styles.logAvatar}
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.logName}>
        {item.admin?.username || item.username || "Root"}
      </Text>
      <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
    </View>
    <Text style={styles.logDate}>
      {date ? date.toLocaleString("tr-TR") : ""}
    </Text>
  </View>
);
}}
/>
)}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Tüm İşlem Geçmişi</Text>

          <FlatList
            data={historyAll}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.logItem}>
                <Image source={{ uri: item.avatar }} style={styles.logAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.logName}>{item.username}</Text>
                  <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
                </View>
                <Text style={styles.logDate}>
                  {new Date(item.date).toLocaleString("tr-TR")}
                </Text>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerRow: {
  flexDirection: "column",   // 🔴 EN KRİTİK SATIR
  alignItems: "center",
  marginBottom: 12,
},
  tabs: { flexDirection: "row" },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
    borderRadius: 8,
    backgroundColor: "#ECECEC",
  },
  tabActive: {
    backgroundColor: "#dcd0ff",
  },
  dealerBalance: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 1,
    color: "#7c3aed",
     marginTop: 15,
  },
  input: {
    backgroundColor: "#ECECEC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  username: { fontSize: 16, fontWeight: "700" },
  role: { fontSize: 12, color: "#666" },
  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: { color: "white", fontWeight: "700" },
  historyTitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  logItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  logAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  logName: { fontSize: 14, fontWeight: "600" },
  logAmount: { color: "#16a34a", fontWeight: "700" },
  logDate: { fontSize: 11, color: "#666" },
  moreBtn: { alignSelf: "center", marginTop: 10 },
  moreText: { color: "#2563eb", fontSize: 14, fontWeight: "600" },
  modalBox: { flex: 1, padding: 18 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  closeBtn: {
    backgroundColor: "#b91c1c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: { color: "white", fontWeight: "700" },
});
