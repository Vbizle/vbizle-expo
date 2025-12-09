import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";

type Props = {
  open: boolean;
  gallery: string[];
  onClose: () => void;
  onSelectFile: (index: number) => void; // Expo Image Picker ile parent tetikliyor
};

export default function CoverEditModal({
  open,
  gallery,
  onClose,
  onSelectFile,
}: Props) {
  if (!open) return null;

  return (
    <Modal transparent animationType="fade" visible={open}>
      {/* Arka plan blur + siyah overlay */}
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Kapak Fotoğrafları</Text>

          {/* 2x2 grid (aynı webdeki gibi) */}
          <View style={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onSelectFile(i)}
                style={styles.slot}
                activeOpacity={0.7}
              >
                {gallery[i] ? (
                  <Image source={{ uri: gallery[i] }} style={styles.image} />
                ) : (
                  <Text style={styles.plus}>+</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Kapat butonu */}
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
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 20,
    borderRadius: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  slot: {
    width: "48%",
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  plus: {
    fontSize: 32,
    color: "rgba(255,255,255,0.4)",
  },

  closeBtn: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#4b5563",
    borderRadius: 8,
    alignItems: "center",
  },

  closeText: {
    color: "white",
    fontSize: 16,
  },
});
