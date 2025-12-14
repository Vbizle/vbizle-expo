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

const PRESETS = [5000, 25000, 50000, 100000, 250000, 500000];

type Props = {
  diamondBalance: number;
  styles: any;
};

export default function DiamondsTab({ diamondBalance, styles }: Props) {
  const user = auth.currentUser;

  const [amount, setAmount] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bankName, setBankName] = useState("");
  const [iban, setIban] = useState("");

  // çekim talepleri
  const [requests, setRequests] = useState<any[]>([]);
  const [showRequests, setShowRequests] = useState(false);
  const [limitCount, setLimitCount] = useState(10);
  const [loadingReqs, setLoadingReqs] = useState(false);

  // ================================
  // ÇEKİM TALEPLERİ (10 / 50)
  // ================================
  useEffect(() => {
    if (!user || !showRequests) return;

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
  }, [user, showRequests, limitCount]);

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
  // GÖNDER
  // ================================
  async function submitWithdraw() {
    if (!fullName || !bankName || !iban) {
      return Alert.alert("Vb", "Tüm alanlar zorunlu.");
    }

    try {
      const res = await fetch(
        "https://us-central1-PROJECT_ID.cloudfunctions.net/createWithdrawRequest",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            fullName,
            bankName,
            iban,
          }),
        }
      );

      const json = await res.json();

      if (!json.ok) {
        return Alert.alert("Vb", json.error || "Hata oluştu.");
      }

      setModalVisible(false);
      setAmount("");
      setFullName("");
      setBankName("");
      setIban("");

      Alert.alert("Vb", "Çekim talebiniz alındı.");

      // liste açıksa yenile
      if (showRequests) {
        setLimitCount(10);
      }
    } catch (e) {
      Alert.alert("Vb", "Sunucu hatası.");
    }
  }

  // ================================
  // UI
  // ================================
  return (
    <ScrollView>
      {/* ÖZET */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vb Elmas</Text>
        <Text style={styles.cardValue}>{diamondBalance}</Text>
        <Text style={styles.cardSub}>USD: {diamondBalance} $</Text>
      </View>

      {/* MİKTAR */}
      <TextInput
        placeholder="Çekilecek Elmas"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      {/* PRESET BUTONLAR */}
      <View style={styles.grid}>
        {PRESETS.map((v) => (
          <TouchableOpacity
            key={v}
            style={styles.preset}
            onPress={() => {
              if (v > diamondBalance) {
                Alert.alert("Vb", "Yetersiz elmas.");
                return;
              }
              setAmount(String(v));
            }}
          >
            <Text style={styles.presetText}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.convertBtn} onPress={handleContinue}>
        <Text style={styles.convertBtnText}>Devam</Text>
      </TouchableOpacity>

      {/* ================================
         ÇEKİM TALEPLERİ BUTONU
      ================================ */}
      <TouchableOpacity
        style={[styles.convertBtn, { marginTop: 20 }]}
        onPress={() => {
          if (!showRequests) {
            setLimitCount(10);
          }
          setShowRequests(!showRequests);
        }}
      >
        <Text style={styles.convertBtnText}>
          {showRequests ? "Çekim Taleplerimi Gizle" : "Çekim Taleplerimi Gör"}
        </Text>
      </TouchableOpacity>

      {/* ================================
         ÇEKİM TALEPLERİ LİSTESİ
      ================================ */}
      {showRequests && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.title}>Çekim Taleplerim</Text>

          {loadingReqs ? (
            <Text>Yükleniyor...</Text>
          ) : requests.length === 0 ? (
            <Text>Henüz talep yok.</Text>
          ) : (
            requests.map((r) => (
              <View key={r.id} style={styles.historyItem}>
                <Text style={styles.historyUser}>
                  {r.diamondAmount} elmas
                </Text>
                <Text style={styles.historyDate}>
                  {r.status === "pending"
                    ? "⏳ Bekleniyor"
                    : r.status === "approved"
                    ? "✅ Onaylandı"
                    : "❌ İptal"}
                </Text>
              </View>
            ))
          )}

          {limitCount === 10 && requests.length >= 10 && (
            <TouchableOpacity onPress={() => setLimitCount(50)}>
              <Text style={{ marginTop: 10, color: "#2563EB" }}>
                Daha fazla gör
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ================================
         MODAL
      ================================ */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <TextInput
              placeholder="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
            <TextInput
              placeholder="Banka Adı"
              value={bankName}
              onChangeText={setBankName}
              style={styles.input}
            />
            <TextInput
              placeholder="IBAN"
              value={iban}
              onChangeText={setIban}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.convertBtn}
              onPress={submitWithdraw}
            >
              <Text style={styles.convertBtnText}>Gönder</Text>
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
