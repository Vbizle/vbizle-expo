// app/dealer/index.tsx

import { auth, db } from "@/firebase/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "./styles";
import { formatVB } from "./utils/formatVB";

import { getAuth } from "firebase/auth";
import DealerHeader from "./components/DealerHeader";
import DealerHistoryList from "./components/DealerHistoryList";
import DealerHistoryModal from "./components/DealerHistoryModal";
import DealerPreviewCard from "./components/DealerPreviewCard";
import RootHistoryList from "./components/RootHistoryList";

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

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // =======================
  // TARİH ARALIĞI FİLTRELEME
  // =======================
  function applyDateFilterWith(logs: any[], s?: Date | null, e?: Date | null) {
    const sDate = s ?? startDate;
    const eDate = e ?? endDate;

    if (!sDate || !eDate || !preview?.uid) {
      setFilteredLogs(logs);
      setTotalAmount(
        logs.reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
      );
      return;
    }

    const start = new Date(sDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(eDate);
    end.setHours(23, 59, 59, 999);

    const filtered = logs.filter((l) => {
      return (
        l.userId === preview.uid &&
        Number(l.date) >= start.getTime() &&
        Number(l.date) <= end.getTime()
      );
    });

    setFilteredLogs(filtered);
    setTotalAmount(
      filtered.reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
    );
  }

  function applyDateFilter(logs: any[]) {
    applyDateFilterWith(logs);
  }

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
      // ⭐ VIP ENGINE — BAYİ YÜKLEMESİ SONRASI
try {
  const authInstance = getAuth();
  const token = await authInstance.currentUser?.getIdToken(true);

  await fetch(
    "https://us-central1-vbizle-f018f.cloudfunctions.net/VipEngine",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        targetUid: preview.uid,
        amount: amt,
      }),
    }
  );
} catch (e) {
  console.warn("VIP Engine çağrısı başarısız:", e);
}


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
      limit(50)
    );

    const snap = await getDocs(q);
    const logs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setHistory10(logs);
    applyDateFilter(logs);
  }

  // =======================
  // ROOT → BAYİ YÜKLEMELERİ
  // =======================
  async function loadRootLogs(uid: string) {
  const q = query(
    collection(db, "loadHistory"),
    where("toUid", "==", uid),
    where("type", "in", ["dealer_wallet_load", "dealer_wallet_deduct"]),
    orderBy("createdAt", "desc"),
    limit(20)
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
      <DealerHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dealerWallet={myData?.dealerWallet}
        formatVB={formatVB}
      />

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

          <DealerPreviewCard
            preview={preview}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            setShowStartPicker={setShowStartPicker}
            setFilteredLogs={setFilteredLogs}
            setTotalAmount={setTotalAmount}
          />

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

          <DealerHistoryList
            data={startDate && endDate ? filteredLogs : history10}
            formatVB={formatVB}
          />

          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowStartPicker(false);
                if (date) {
                  setStartDate(date);
                  setShowEndPicker(true);
                }
              }}
            />
          )}

          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(e, date) => {
                setShowEndPicker(false);
                if (date) {
                  setEndDate(date);
                  applyDateFilterWith(history10, startDate, date);
                }
              }}
            />
          )}

          <TouchableOpacity style={styles.moreBtn} onPress={loadAllLogs}>
            <Text style={styles.moreText}>Daha Fazla Gör</Text>
          </TouchableOpacity>
        </>
      )}

      {activeTab === "root" && (
        <RootHistoryList data={rootHistory} formatVB={formatVB} />
      )}

      <DealerHistoryModal
        visible={modalVisible}
        historyAll={historyAll}
        onClose={() => setModalVisible(false)}
        formatVB={formatVB}
      />
    </View>
  );
}
