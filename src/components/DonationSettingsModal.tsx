import { auth, db } from "@/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DonationSettingsModal({
  roomId,
  room,
  visible,
  onClose,
}) {
  if (!visible) return null;

  const user = auth.currentUser;
  const isOwner = user && room?.ownerId === user.uid;

  const [title, setTitle] = useState(room?.donationTitle || "");
  const [target, setTarget] = useState(String(room?.donationTarget || 1000));

  // ==========================================================
  // GÜVENLİ KAYDETME
  // ==========================================================
  async function saveSettings() {
    if (!isOwner) {
      Alert.alert("Hata", "Bu ayarı sadece oda sahibi düzenleyebilir.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Hata", "Başlık boş olamaz!");
      return;
    }

    const targetNum = Number(target);

    if (isNaN(targetNum) || targetNum < 1) {
      Alert.alert("Hata", "Hedef 1 VB'den küçük olamaz.");
      return;
    }

    if (targetNum > 1_000_000) {
      Alert.alert("Hata", "Hedef en fazla 1.000.000 VB olabilir.");
      return;
    }

    await updateDoc(doc(db, "rooms", roomId), {
      donationTitle: title.trim(),
      donationTarget: targetNum,
    });

    onClose();
  }

  // ==========================================================
  // GÜVENLİ RESET
  // ==========================================================
  async function resetDonationBar() {
    if (!isOwner) {
      Alert.alert("Hata", "Bu işlemi sadece oda sahibi yapabilir.");
      return;
    }

    await updateDoc(doc(db, "rooms", roomId), {
      donationCurrent: 0,
      lastReset: Date.now(),
    });

    Alert.alert("Başarılı", "Bağış barı sıfırlandı.");
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>Bağış Ayarları</Text>

          {/* Bağış başlığı */}
          <Text style={styles.label}>Bağış Yazısı</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Bağış başlığı..."
            placeholderTextColor="#999"
            maxLength={60}
          />

          {/* Hedef */}
          <Text style={styles.label}>Hedef (VB)</Text>
          <TextInput
            style={styles.input}
            value={target}
            keyboardType="numeric"
            onChangeText={setTarget}
            placeholder="1000"
            placeholderTextColor="#999"
            maxLength={10}
          />

          {/* Kaydet */}
          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
            <Text style={styles.saveText}>Kaydet</Text>
          </TouchableOpacity>

          {/* RESET */}
          <TouchableOpacity style={styles.resetBtn} onPress={resetDonationBar}>
            <Text style={styles.resetText}>🚨 Bağış Barını Sıfırla</Text>
          </TouchableOpacity>

          {/* Kapat */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 300,
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 14,
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  header: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    color: "white",
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#7c3aed",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  saveText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  resetBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  resetText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  closeBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeText: {
    textAlign: "center",
    color: "white",
  },
});
