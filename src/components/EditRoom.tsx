import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditRoom({
  visible,
  newRoomName,
  setNewRoomName,
  newRoomImage,          // 🔥 EK: preview için
  setNewRoomImage,
  saveRoomSettings,
  saving,
  onClose,
}) {
  if (!visible) return null;

  /* --------------------------------------------------
     📷 GALERİDEN RESİM SEÇ
  -------------------------------------------------- */
  async function pickImage() {
    // izin iste
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      alert("Galeri izni verilmedi");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images, // ✅ deprecated FIX
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      selectionLimit: 1,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    // 🔥 sadece asset gönderiyoruz (upload üst katmanda)
    setNewRoomImage(asset);
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

          {/* 🔥 PREVIEW */}
          {newRoomImage?.uri && (
            <Image
              source={{ uri: newRoomImage.uri }}
              style={styles.preview}
            />
          )}

          {/* BUTTONS */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
            >
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

/* ----------------------------------------- */

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
    marginBottom: 12,
  },

  fileBtnText: {
    textAlign: "center",
    color: "white",
  },

  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 12,
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
