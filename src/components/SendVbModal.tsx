import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  updateDoc,
  increment,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

type Props = {
  visible: boolean;
  onClose: () => void;
  toUser: {
    uid: string;
    name: string;
    avatar?: string;
  } | null;
  roomId?: string;
  currentBalance: number;
};

export default function SendVbModal({
  visible,
  onClose,
  toUser,
  roomId,
  currentBalance,
}: Props) {
  const [sending, setSending] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [senderProfile, setSenderProfile] = useState<any>(null);

  const fromUid = auth.currentUser?.uid;
  const presetAmounts = [25, 50, 100, 1000];

  // Gönderen profilini al
  useEffect(() => {
    async function loadSender() {
      if (!fromUid) return;
      const ref = doc(db, "users", fromUid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setSenderProfile(snap.data());
      }
    }
    loadSender();
  }, [fromUid]);

  // VB Gönder
  async function send(amount: number) {
    setErrorMsg("");

    if (!fromUid) return setErrorMsg("Giriş yapmalısınız!");
    if (!toUser) return setErrorMsg("Kullanıcı bulunamadı!");
    if (amount <= 0) return;
    if (currentBalance < amount) return setErrorMsg("Yetersiz bakiye!");

    setSending(true);

    try {
      // Gönderen → bakiye azalt
      await updateDoc(doc(db, "users", fromUid), {
        vbBalance: increment(-amount),
        vbTotalSent: increment(amount),
      });

      // Alıcı → bakiye artır
      await updateDoc(doc(db, "users", toUser.uid), {
        vbBalance: increment(amount),
        vbTotalReceived: increment(amount),
      });

      // Transaction kaydı
      await addDoc(collection(db, "transactions"), {
        fromUid,
        toUid: toUser.uid,

        fromName: senderProfile?.username || "Kullanıcı",
        fromAvatar: senderProfile?.avatar || "",

        toName: toUser.name || "Kullanıcı",
        toAvatar: toUser.avatar || "",

        amount,
        type: "vb_send",
        roomId: roomId || null,
        timestamp: serverTimestamp(),
      });

      // Oda donation bar güncelle
      if (roomId) {
        await updateDoc(doc(db, "rooms", String(roomId)), {
          donationCurrent: increment(amount),
        });
      }

      // Premium chat mesajı
      if (roomId) {
        await addDoc(collection(db, "rooms", String(roomId), "chat"), {
          type: "vb_premium",
          fromUid,
          fromName: senderProfile?.username || "Kullanıcı",
          fromAvatar: senderProfile?.avatar || "",

          toUid: toUser.uid,
          toName: toUser.name,
          toAvatar: toUser.avatar,

          amount,
          text: `💸 ${amount} Vb gönderildi`,
          createdAt: Date.now(),
          timestamp: serverTimestamp(),
        });
      }

      onClose();
    } catch (err) {
      console.log("SEND VB ERROR:", err);
      setErrorMsg("Bir hata oluştu!");
    } finally {
      setSending(false);
    }
  }

  if (!visible || !toUser) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>💸 VB Gönder</Text>

          <Text style={styles.subtitle}>
            {toUser.name} kişisine gönderiyorsun
          </Text>

          <Text style={styles.balance}>
            Mevcut bakiye: {currentBalance} Vb
          </Text>

          {errorMsg !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Hazır miktarlar */}
          <View style={styles.presetGrid}>
            {presetAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.presetBtn}
                disabled={sending}
                onPress={() => send(amt)}
              >
                <Text style={styles.presetBtnText}>{amt} Vb</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom miktar */}
          <TextInput
            placeholder="Özel miktar"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={setCustomAmount}
            style={styles.input}
          />

          <TouchableOpacity
            disabled={sending || !customAmount}
            onPress={() => send(Number(customAmount))}
            style={styles.sendBtn}
          >
            {sending ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.sendBtnText}>Gönder</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity disabled={sending} onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// =====================================================
// STYLES
// =====================================================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: 320,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 6,
  },
  balance: {
    color: "#4ade80",
    textAlign: "center",
    marginBottom: 12,
  },
  errorBox: {
    backgroundColor: "rgba(255,0,0,0.2)",
    padding: 6,
    borderRadius: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "#ff7b7b",
    textAlign: "center",
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  presetBtn: {
    width: "48%",
    backgroundColor: "#7e22ce",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  presetBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    color: "white",
    marginBottom: 12,
  },
  sendBtn: {
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  sendBtnText: {
    textAlign: "center",
    fontWeight: "700",
    color: "black",
  },
  closeBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 12,
    borderRadius: 10,
  },
  closeBtnText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
});
