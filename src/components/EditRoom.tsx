import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function EditRoom({
  visible,
  newRoomName,
  setNewRoomName,
  setNewRoomImage,
  saveRoomSettings,
  saving,
  onClose,
}) {
  if (!visible) return null;

  // 🔥 Expo Image Picker
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setNewRoomImage(result.assets[0]); // RN'de FILE nesnesi böyle gelir
    }
  }

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.title}>Oda Ayarları</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Room Name */}
          <TextInput
            value={newRoomName}
            onChangeText={setNewRoomName}
            placeholder="Oda adı..."
            placeholderTextColor="#999"
            style={styles.input}
          />

          {/* Image Picker */}
          <TouchableOpacity style={styles.fileBtn} onPress={pickImage}>
            <Text style={styles.fileBtnText}>📁 Oda Resmi Seç</Text>
          </TouchableOpacity>

          {/* BUTTONS */}
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Kapat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={saveRoomSettings}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// -----------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },

  close: {
    fontSize: 22,
    color: "rgba(255,255,255,0.7)",
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

  fileBtn: {
    paddingVertical: 12,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 18,
  },

  fileBtnText: {
    textAlign: "center",
    color: "white",
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  cancelBtn: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  cancelText: {
    color: "white",
    fontWeight: "bold",
  },

  saveBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  saveText: {
    color: "white",
    fontWeight: "bold",
  },
});
