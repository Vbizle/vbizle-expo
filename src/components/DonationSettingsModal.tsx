import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { db } from "@/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function DonationSettingsModal({
  roomId,
  room,
  visible,
  onClose,
}) {
  const [title, setTitle] = useState(room?.donationTitle || "");
  const [target, setTarget] = useState(String(room?.donationTarget || 1000));

  if (!visible) return null;

  async function saveSettings() {
    await updateDoc(doc(db, "rooms", roomId), {
      donationTitle: title,
      donationTarget: Number(target),
    });

    onClose();
  }

  async function resetDonationBar() {
    await updateDoc(doc(db, "rooms", roomId), {
      donationCurrent: 0,
      lastReset: Date.now(),
    });
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.header}>Bağış Ayarları</Text>

          {/* Bağış yazısı */}
          <Text style={styles.label}>Bağış Yazısı</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Bağış başlığı..."
            placeholderTextColor="#999"
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
          />

          {/* Kaydet */}
          <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
            <Text style={styles.saveText}>Kaydet</Text>
          </TouchableOpacity>

          {/* Reset */}
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
