import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { auth, db } from "@/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { StyleSheet } from "react-native";

const PRESETS = [5000, 25000, 50000, 100000, 250000, 500000];

type Props = {
  diamondBalance: number;
  styles: any;
};

/* ======================================================
   🕒 TARİH FORMATLAYICI
====================================================== */
function formatDate(ts: any) {
  if (!ts) return "";
  const d =
    typeof ts === "number"
      ? new Date(ts)
      : ts?.toDate
      ? ts.toDate()
      : new Date(ts);

  return d.toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isValidIban(iban: string): boolean {
  const trimmed = iban.replace(/\s+/g, "").toUpperCase();

  // TR + 24 rakam = 26 karakter
  if (!/^TR\d{24}$/.test(trimmed)) return false;

  // IBAN MOD 97 algoritması
  const rearranged = trimmed.slice(4) + trimmed.slice(0, 4);

  let numeric = "";
  for (const ch of rearranged) {
    const code = ch.charCodeAt(0);
    numeric += code >= 65 && code <= 90 ? String(code - 55) : ch;
  }

  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + Number(numeric[i])) % 97;
  }

  return remainder === 1;
}

export default function DiamondsTab({ diamondBalance, styles }: Props) {
  const user = auth.currentUser;

  const [amount, setAmount] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // 🔽 Çekim talepleri modalı
  const [requestsModalVisible, setRequestsModalVisible] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");

  const [requests, setRequests] = useState<any[]>([]);
  const [limitCount, setLimitCount] = useState(25);
  const [loadingReqs, setLoadingReqs] = useState(false);

  // ================================
  // ÇEKİM TALEPLERİ
  // ================================
  useEffect(() => {
    if (!user || !requestsModalVisible) return;

    async function load() {
      setLoadingReqs(true);

      const q = query(
        collection(db, "withdrawRequests"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snap = await getDocs(q);
      const arr: any[] = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setRequests(arr);
      setLoadingReqs(false);
    }

    load();
  }, [user, requestsModalVisible, limitCount]);

  // ================================
  // DEVAM
  // ================================
  function handleContinue() {
    const val = Number(amount);
    if (!val || val < 5000) {
      return Alert.alert("Vb", "Minimum çekim 5000 elmas.");
    }
    if (val > diamondBalance) {
      return Alert.alert("Vb", "Yetersiz elmas.");
    }
    setModalVisible(true);
  }

  // ================================
  // GERÇEK BACKEND ÇEKİM
  // ================================
  async function submitWithdraw() {
    if (!fullName || !bankName || !iban) {
      return Alert.alert("Vb", "Tüm alanlar zorunlu.");
    }
    if (!isValidIban(iban)) {
    return Alert.alert("Vb", "IBAN bilgisi geçersizdir.");
  }
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      return Alert.alert("Vb", "Oturum bulunamadı.");
    }

    try {
      const res = await fetch(
        "https://us-central1-vbizle-f018f.cloudfunctions.net/createWithdrawRequest",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: Number(amount),
            fullName,
            bankName,
            iban,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "Sunucu hatası");
      }

      setModalVisible(false);
      setAmount("");
      setFullName("");
      setBankName("");
      setIban("");

      Alert.alert("Vb", "Çekim talebiniz alındı.");
    } catch (err: any) {
      Alert.alert("Vb", err.message || "Sunucu hatası");
    }
  }

  // ================================
  // UI
  // ================================
  return (
    <ScrollView>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vb Elmas</Text>
        <Text style={styles.cardValue}>{diamondBalance}</Text>
        <Text style={styles.cardSub}>USD: {diamondBalance} $</Text>
      </View>

      <TextInput
        placeholder="Çekilecek Elmas"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <View style={styles.grid}>
        {PRESETS.map((v) => (
          <TouchableOpacity
            key={v}
            style={styles.preset}
            onPress={() => setAmount(String(v))}
          >
            <Text style={styles.presetText}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.convertBtn} onPress={handleContinue}>
        <Text style={styles.convertBtnText}>Devam</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.convertBtn, { marginTop: 20 }]}
        onPress={() => {
          setLimitCount(25);
          setRequestsModalVisible(true);
        }}
      >
        <Text style={styles.convertBtnText}>Çekim Taleplerimi Gör</Text>
      </TouchableOpacity>

      {/* ================================
         📜 ÇEKİM TALEPLERİ MODALI
      ================================ */}
      <Modal visible={requestsModalVisible} transparent animationType="fade">
        <View style={reqModalStyles.overlay}>
          <View style={reqModalStyles.card}>
            <Text style={reqModalStyles.title}>Çekim Taleplerim</Text>

            {loadingReqs ? (
              <Text>Yükleniyor...</Text>
            ) : requests.length === 0 ? (
              <Text>Henüz talep yok.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {requests.map((r) => (
                  <View key={r.id} style={styles.historyItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>
                        {r.diamondAmount} elmas
                      </Text>

                      <Text
                        style={{
                          fontWeight: "700",
                          color:
                            r.status === "approved"
                              ? "#16A34A"
                              : r.status === "pending"
                              ? "#F59E0B"
                              : "#DC2626",
                        }}
                      >
                        {r.status === "pending"
                          ? "⏳ Beklemede"
                          : r.status === "approved"
                          ? "✅ Onaylandı"
                          : "⛔ Reddedildi"}
                      </Text>
                    </View>

                    <Text style={styles.historyDate}>
                      {formatDate(r.createdAt)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[reqModalStyles.closeBtn, { marginTop: 15 }]}
              onPress={() => setRequestsModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================================
         ÇEKİM GÖNDERME MODALI (AYNEN)
      ================================ */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={modalStyles.modalBg}>
          <View style={modalStyles.modalCard}>
            <TextInput
              placeholder="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              style={modalStyles.input}
            />
            <TextInput
              placeholder="Banka Adı"
              value={bankName}
              onChangeText={setBankName}
              style={modalStyles.input}
            />
            <TextInput
              placeholder="IBAN"
              value={iban}
              onChangeText={setIban}
              style={modalStyles.input}
            />

            <TouchableOpacity
              style={modalStyles.convertBtn}
              onPress={submitWithdraw}
            >
              <Text style={modalStyles.convertBtnText}>Gönder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ textAlign: "center" }}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const reqModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  closeBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});

const modalStyles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    paddingTop: "28%",
  },
  modalCard: {
    width: "85%",
    alignSelf: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  convertBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  convertBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
