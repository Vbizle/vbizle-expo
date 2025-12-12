import { auth, db } from "@/firebase/firebaseConfig";
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { walletEngine } from "@/src/services/walletEngine";
import AdminButton from "./components/AdminButton";
import AdminCard from "./components/AdminCard";

export default function LoadBalanceScreen() {
  const [vbId, setVbId] = useState("");
  const [amount, setAmount] = useState("");

  const [me, setMe] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  // Yeni: giriş yapan kişinin Firestore verisi
  const [myData, setMyData] = useState<any>(null);

  // Kullanıcı önizleme
  const [preview, setPreview] = useState<any>(null);
  const [fetching, setFetching] = useState(false);

  // Tek tık kilidi
  const [loading, setLoading] = useState(false);

  // Yükleme tipi: root / dealer / system
  const [loadType, setLoadType] = useState<"root" | "dealer" | "system">("root");

  // ⭐ EKLENDİ: Bayi yapma/çıkarma işlemi sırasında kilit
  const [dealerLoading, setDealerLoading] = useState(false);

  // ⭐ EKLENDİ: Bayi bakiye yükleme kilidi
  const [dealerBalanceLoading, setDealerBalanceLoading] = useState(false);

  // ⭐ EKLENDİ: Normal bakiye yönetim kilidi
  const [balanceLoading, setBalanceLoading] = useState(false);

  // ======================================================
  // AUTH
  // ======================================================
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (u) {
        await u.getIdToken();
        setMe(u);

        // Kullanıcının firestore profilini çek
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setMyData(snap.data());
        }
      }
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  // ======================================================
  // VB-ID → Kullanıcı arama
  // ======================================================
  useEffect(() => {
    if (!vbId.trim()) {
      setPreview(null);
      return;
    }

    const timer = setTimeout(() => {
      findUserByVbId(vbId.trim().toUpperCase());
    }, 400);

    return () => clearTimeout(timer);
  }, [vbId]);

  async function findUserByVbId(vbId: string) {
    try {
      setFetching(true);

      const q = query(collection(db, "users"), where("vbId", "==", vbId));
      const snap = await getDocs(q);

      if (snap.empty) {
        setPreview({ notFound: true });
      } else {
        const data = snap.docs[0].data();
        setPreview({
          uid: snap.docs[0].id,
          username: data.username,
          avatar: data.avatar,
          role: data.role || "user",
          vbId: data.vbId,

          // ⭐ EK
          isDealer: data.isDealer === true,
          dealerWallet: data.dealerWallet ?? 0,

          // ⭐ NORMAL BAKİYE EKLENDİ
          vbBalance: data.vbBalance ?? 0,
        });
      }
    } catch {
      setPreview(null);
    } finally {
      setFetching(false);
    }
  }

  // ======================================================
  // ⭐ NORMAL BAKİYE → ARTIR
  // ======================================================
  async function increaseNormalBalance() {
    if (!preview?.uid) return;
    if (balanceLoading) return;
    setBalanceLoading(true);

    try {
      if (myData?.role !== "root") {
        Alert.alert("Yetki yok", "Bu işlem sadece ROOT tarafından yapılabilir.");
        setBalanceLoading(false);
        return;
      }

      const amt = Number(amount);
      if (!amt || amt <= 0) {
        Alert.alert("Hata", "Geçerli bir miktar girin.");
        setBalanceLoading(false);
        return;
      }

      await updateDoc(doc(db, "users", preview.uid), {
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      setPreview({
        ...preview,
        vbBalance: (preview.vbBalance ?? 0) + amt,
      });

      Alert.alert("Başarılı", `Normal bakiye ${amt} VB artırıldı.`);
    } catch (err) {
      Alert.alert("Hata", "Normal bakiye artırılamadı.");
    }

    setBalanceLoading(false);
  }

  // ======================================================
  // ⭐ NORMAL BAKİYE → AZALT
  // ======================================================
  async function decreaseNormalBalance() {
    if (!preview?.uid) return;

    const current = preview.vbBalance ?? 0;
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      Alert.alert("Hata", "Geçerli bir miktar girin.");
      return;
    }

    if (amt > current) {
      Alert.alert("Hata", "Bu kadar azaltılamaz. Bakiye yetersiz.");
      return;
    }

    await updateDoc(doc(db, "users", preview.uid), {
      vbBalance: current - amt,
    });

    setPreview({ ...preview, vbBalance: current - amt });

    Alert.alert("Başarılı", `Normal bakiye ${amt} VB azaltıldı.`);
  }

  // ======================================================
  // ⭐ NORMAL BAKİYE → YENİ DEĞER AYARLA
  // ======================================================
  async function setNormalBalance() {
    if (!preview?.uid) return;

    const amt = Number(amount);
    if (amt < 0) {
      Alert.alert("Hata", "Negatif değer olamaz.");
      return;
    }

    await updateDoc(doc(db, "users", preview.uid), {
      vbBalance: amt,
    });

    setPreview({ ...preview, vbBalance: amt });

    Alert.alert("Başarılı", `Normal bakiye ${amt} VB olarak ayarlandı.`);
  }

  // ======================================================
  // ⭐ BAYİ BAKİYESİ → AZALT
  // ======================================================
  async function decreaseDealerBalance() {
    if (!preview?.uid || !preview.isDealer) return;

    const current = preview.dealerWallet ?? 0;
    const amt = Number(amount);

    if (!amt || amt <= 0) {
      Alert.alert("Hata", "Geçerli miktar girin.");
      return;
    }

    if (amt > current) {
      Alert.alert("Hata", "Bayinin bakiyesi yetersiz.");
      return;
    }

    await updateDoc(doc(db, "users", preview.uid), {
      dealerWallet: current - amt,
    });

    setPreview({ ...preview, dealerWallet: current - amt });

    Alert.alert("Başarılı", `Bayi bakiyesi ${amt} VB azaltıldı.`);
  }

  // ======================================================
  // ⭐ BAYİ BAKİYESİ → YENİ DEĞER AYARLA
  // ======================================================
  async function setDealerBalance() {
    if (!preview?.uid || !preview.isDealer) return;

    const amt = Number(amount);
    if (amt < 0) {
      Alert.alert("Hata", "Negatif değer olamaz.");
      return;
    }

    await updateDoc(doc(db, "users", preview.uid), {
      dealerWallet: amt,
    });

    setPreview({ ...preview, dealerWallet: amt });

    Alert.alert("Başarılı", `Bayi bakiyesi ${amt} VB olarak ayarlandı.`);
  }

  // ======================================================
  // ⭐ EKLENDİ — ROOT → Bayi bakiye yükle (artır)
  // ======================================================
  async function addDealerBalance() {
    if (!preview?.uid || !preview?.isDealer) return;

    if (dealerBalanceLoading) return;
    setDealerBalanceLoading(true);

    try {
      if (myData?.role !== "root") {
        Alert.alert("Yetki yok", "Bayi bakiyesi sadece ROOT tarafından yüklenir.");
        setDealerBalanceLoading(false);
        return;
      }

      const amt = Number(amount);
      if (!amt || amt <= 0) {
        Alert.alert("Hata", "Geçerli miktar girin.");
        setDealerBalanceLoading(false);
        return;
      }

      await updateDoc(doc(db, "users", preview.uid), {
        dealerWallet: (preview.dealerWallet ?? 0) + amt,
      });

      setPreview({
        ...preview,
        dealerWallet: (preview.dealerWallet ?? 0) + amt,
      });

      Alert.alert("Başarılı", `Bayinin bakiyesi ${amt} VB artırıldı.`);
    } catch (e: any) {
      Alert.alert("Hata", e?.message ?? "Bir hata oluştu");
    }

    setDealerBalanceLoading(false);
  }

  // ======================================================
  // ⭐ EKLENDİ — ROOT → BAYİ YAPMA / BAYİLİKTEN ÇIKARMA
  // ======================================================
  async function toggleDealer() {
    if (!preview?.uid) return;

    if (dealerLoading) return;
    setDealerLoading(true);

    try {
      if (myData?.role !== "root") {
        Alert.alert("Yetki yok", "Bu işlemi sadece ROOT yapabilir.");
        setDealerLoading(false);
        return;
      }

      const newState = !preview.isDealer;

      await updateDoc(doc(db, "users", preview.uid), {
        isDealer: newState,
      });

      setPreview({ ...preview, isDealer: newState });

      Alert.alert(
        "Başarılı",
        newState ? "Kullanıcı artık BAYİ." : "Kullanıcı bayilikten çıkarıldı."
      );
    } catch (e: any) {
      Alert.alert("Hata", e?.message ?? "Bir hata oluştu");
    }

    setDealerLoading(false);
  }

  // ======================================================
  // SUBMIT → NORMAL YÜKLEME
  // ======================================================
  async function submit() {
    if (loading) return;
    setLoading(true);

    try {
      if (!authReady || !me || !myData) {
        Alert.alert("Hata", "Hesap yüklenmedi.");
        setLoading(false);
        return;
      }

      // ROLE KONTROL
      if (myData.role !== "root" && myData.role !== "dealer") {
        Alert.alert("Yetki yok", "Bu işlemi sadece Root veya Bayi yapabilir.");
        setLoading(false);
        return;
      }

      // BAYİ CÜZDAN KONTROLÜ
      if (myData.role === "dealer") {
        const limit = myData.dealerWallet ?? 0;
        const amt = Number(amount);

        if (amt > limit) {
          Alert.alert(
            "Bayi Bakiyesi Yetersiz",
            `Mevcut bakiye: ${limit} VB\nLütfen Root'tan bakiye yükletin.`
          );
          setLoading(false);
          return;
        }
      }

      const clean = vbId.trim().toUpperCase();
      if (!clean) {
        Alert.alert("Hata", "VB-ID gerekli.");
        setLoading(false);
        return;
      }

      const amt = Number(amount);
      if (!amt || amt <= 0) {
        Alert.alert("Hata", "Geçerli miktar girin.");
        setLoading(false);
        return;
      }

      const finalSource =
        myData.role === "dealer" ? "dealer" : loadType;

      await walletEngine.adminLoadByVbId({
        toVbId: clean,
        amount: amt,
        source: finalSource,
      });

      if (myData.role === "dealer") {
        await updateDoc(doc(db, "users", me.uid), {
          dealerWallet: (myData.dealerWallet ?? 0) - amt,
        });
      }

      Alert.alert("Başarılı", `${amount} VB yüklendi.`);
      setVbId("");
      setAmount("");
      setPreview(null);
    } catch {
      Alert.alert("Hata", "Yükleme yapılamadı.");
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <AdminCard title="VB Bakiye Yönetimi">

        {/* ROOT → yükleme tipi seçebilir */}
        {myData?.role === "root" && (
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeBtn, loadType === "root" && styles.typeActive]}
              onPress={() => setLoadType("root")}
            >
              <Text style={styles.typeText}>Root</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, loadType === "dealer" && styles.typeActive]}
              onPress={() => setLoadType("dealer")}
            >
              <Text style={styles.typeText}>Bayi</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeBtn, loadType === "system" && styles.typeActive]}
              onPress={() => setLoadType("system")}
            >
              <Text style={styles.typeText}>Sistem</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* VB-ID INPUT */}
        <TextInput
          style={styles.input}
          placeholder="Kullanıcı VB-ID (örn: VB-21)"
          value={vbId}
          onChangeText={setVbId}
        />

        {/* ÖNİZLEME */}
        {fetching && <ActivityIndicator color="#7c3aed" style={{ marginBottom: 10 }} />}

        {preview?.notFound && <Text style={styles.notFound}>Kullanıcı bulunamadı</Text>}

        {preview && !preview.notFound && (
          <View style={styles.previewCard}>
            <Image source={{ uri: preview.avatar }} style={styles.avatar} />
            <View>
              <Text style={styles.previewName}>{preview.username}</Text>
              <Text style={styles.previewRole}>{preview.role}</Text>
              <Text style={styles.previewId}>{preview.vbId}</Text>

              {/* ⭐ ONLY ROOT normal bakiye görebilir */}
              {myData?.role === "root" && (
                <Text style={{ marginTop: 4, fontSize: 12, color: "#111" }}>
                  Normal Bakiye: {preview.vbBalance} VB
                </Text>
              )}

              {/* ⭐ ONLY ROOT bayi bakiyesi görebilir */}
              {preview.isDealer && myData?.role === "root" && (
                <Text style={{ fontSize: 12, color: "#7c3aed", marginTop: 4 }}>
                  Bayi Bakiye: {preview.dealerWallet} VB
                </Text>
              )}
            </View>

            {/* ⭐ ROOT → Bayi Yap/Çıkar */}
            {myData?.role === "root" && (
              <TouchableOpacity
                style={{
                  marginLeft: "auto",
                  backgroundColor: preview.isDealer ? "#b91c1c" : "#16a34a",
                  paddingVertical: 4,
                  paddingHorizontal: 11,
                  borderRadius: 61,
                  maxWidth: 100,
                }}
                onPress={toggleDealer}
                disabled={dealerLoading}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {dealerLoading
                    ? "İşlem..."
                    : preview.isDealer
                    ? "BAYİLİKTEN ÇIKAR"
                    : "BAYİ YAP"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ============================= */}
        {/* ⭐ BAYİ BAKİYE YÖNETİMİ (SADECE ROOT) */}
        {/* ============================= */}
        {preview?.isDealer && myData?.role === "root" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Bayi işlem miktarı"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <AdminButton
              title={dealerBalanceLoading ? "Yükleniyor..." : "Bayi Bakiye Ekle (+)"}
              onPress={addDealerBalance}
              disabled={dealerBalanceLoading}
            />

            <AdminButton
              title="Bayi Bakiye Azalt (-)"
              onPress={decreaseDealerBalance}
            />

            <AdminButton
              title="Bayi Yeni Bakiye Ayarla"
              onPress={setDealerBalance}
            />
          </>
        )}

        {/* ============================= */}
        {/* ⭐ NORMAL BAKİYE YÖNETİMİ (SADECE ROOT) */}
        {/* ============================= */}
        {preview && myData?.role === "root" && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Normal bakiye miktarı"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <AdminButton
              title="Normal Bakiye Ekle (+)"
              onPress={increaseNormalBalance}
            />

            <AdminButton
              title="Normal Bakiye Azalt (-)"
              onPress={decreaseNormalBalance}
            />

            <AdminButton
              title="Normal Yeni Bakiye Ayarla"
              onPress={setNormalBalance}
            />
          </>
        )}

        {/* NORMAL YÜKLEME (ROOT + BAYİ) */}
        <TextInput
          style={styles.input}
          placeholder="Yükleme miktarı"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <AdminButton
          title={loading ? "Gönderiliyor..." : "Bakiye Yükle"}
          onPress={submit}
          disabled={loading}
        />

      </AdminCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },

  typeRow: { flexDirection: "row", marginBottom: 12 },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#888",
    alignItems: "center",
    marginHorizontal: 4,
  },
  typeActive: { backgroundColor: "#7c3aed" },
  typeText: { color: "white", fontWeight: "600" },

  input: {
    backgroundColor: "#ECECEC",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  notFound: { color: "#b91c1c", marginBottom: 10 },

  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  previewName: { fontSize: 16, fontWeight: "700" },
  previewRole: { fontSize: 12, color: "#2563eb" },
  previewId: { fontSize: 12, color: "#6B7280" },
});
