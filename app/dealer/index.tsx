// app/dealer/index.tsx

import { auth, db } from "@/firebase/firebaseConfig";
import { useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
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

  const [vbId, setVbId] = useState("");
  const [amount, setAmount] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [preview, setPreview] = useState<any>(null);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [history10, setHistory10] = useState<any[]>([]);
  const [historyAll, setHistoryAll] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  // =======================
  // AUTH + BAYİ KONTROLÜ
  // =======================
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setMe(u);
        const snap = await getDoc(doc(db, "users", u.uid));
        if (!snap.exists()) {
          Alert.alert("Hata", "Kullanıcı bulunamadı.");
          return;
        }

        const d = snap.data();
        setMyData(d);

        if (!d.isDealer) {
          Alert.alert("Yetki Yok", "Bu alana sadece bayiler girebilir.");
          router.back();
          return;
        }

        loadLast10Logs(u.uid);
      }
      setLoadingUser(false);
    });

    return () => unsub();
  }, []);

  // =======================
  // Kullanıcı Ara (VB-ID)
  // =======================
  async function findUser() {
    if (!vbId.trim()) {
      setPreview(null);
      return;
    }

    try {
      setSearchLoading(true);

      const q = query(collection(db, "users"), where("vbId", "==", vbId.trim().toUpperCase()));
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

      // 1) Kullanıcı vbBalance artır
      await updateDoc(doc(db, "users", preview.uid), {
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      // 2) Bayinin bakiyesini düşür
      await updateDoc(doc(db, "users", me.uid), {
        dealerWallet: dealerBalance - amt,
      });

      // 3) İşlem geçmişine kaydet
      await addDoc(collection(db, "dealerHistory", me.uid, "logs"), {
        userId: preview.uid,
        username: preview.username,
        avatar: preview.avatar,
        amount: amt,
        date: Date.now(),
      });

      Alert.alert("Başarılı", `${amt} VB yüklendi.`);

      // Önizlemeyi güncelle
      setPreview({
        ...preview,
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      // Bayi bakiyesini güncelle
      setMyData({
        ...myData,
        dealerWallet: dealerBalance - amt,
      });

      // Listeyi yenile
      loadLast10Logs(me.uid);

      setAmount("");
    } catch (err) {
      Alert.alert("Hata", "İşlem gerçekleştirilemedi.");
    }

    setSubmitLoading(false);
  }

  // =======================
  // SON 10 LOGU ÇEK
  // =======================
  async function loadLast10Logs(uid: string) {
    const q = query(
      collection(db, "dealerHistory", uid, "logs"),
      orderBy("date", "desc"),
      limit(10)
    );

    const snap = await getDocs(q);
    const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setHistory10(arr);
  }

  // =======================
  // TÜM LOG LİSTESİ
  // =======================
  async function loadAllLogs() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.dealerBalance}>
        Bayi Bakiye: {myData?.dealerWallet ?? 0} VB
      </Text>

      {/* VB-ID INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Kullanıcı VB-ID (örn: VB-21)"
        value={vbId}
        onChangeText={setVbId}
        onBlur={findUser}
      />

      {searchLoading && <ActivityIndicator color="#7c3aed" />}

      {/* ÖNİZLEME */}
      {preview?.notFound && (
        <Text style={{ color: "#b91c1c", marginTop: 10 }}>Kullanıcı bulunamadı</Text>
      )}

      {preview && !preview.notFound && (
        <View style={styles.previewCard}>
          <Image source={{ uri: preview.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{preview.username}</Text>
            <Text style={styles.role}>{preview.role}</Text>
            <Text style={styles.role}>Mevcut Bakiye: {preview.vbBalance} VB</Text>
          </View>
        </View>
      )}

      {/* MİKTAR INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Yüklenecek miktar"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* YÜKLEME BUTONU */}
      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={submitLoading}
      >
        <Text style={styles.btnText}>
          {submitLoading ? "Gönderiliyor..." : "Bakiye Yükle"}
        </Text>
      </TouchableOpacity>

      {/* SON 10 LOG */}
      <Text style={styles.historyTitle}>Son İşlemler</Text>

      <FlatList
        data={history10}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logItem}>
            <Image source={{ uri: item.avatar }} style={styles.logAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.logName}>{item.username}</Text>
              <Text style={styles.logAmount}>+{item.amount} VB</Text>
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

      {/* TAM LİSTE MODAL */}
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
                  <Text style={styles.logAmount}>+{item.amount} VB</Text>
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
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dealerBalance: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#7c3aed",
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: "700",
  },
  role: {
    fontSize: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#7c3aed",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: {
    color: "white",
    fontWeight: "700",
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  logAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  logName: {
    fontSize: 14,
    fontWeight: "600",
  },
  logAmount: {
    color: "#16a34a",
    fontWeight: "700",
  },
  logDate: {
    fontSize: 11,
    color: "#666",
  },
  moreBtn: {
    alignSelf: "center",
    marginTop: 10,
  },
  moreText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  modalBox: {
    flex: 1,
    padding: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  closeBtn: {
    backgroundColor: "#b91c1c",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  closeText: {
    color: "white",
    fontWeight: "700",
  },
});
