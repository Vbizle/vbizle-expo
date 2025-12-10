import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  open: boolean;
  gallery: string[];
  onClose: () => void;
  onSelectFile: (index: number) => void;
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
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Kapak Fotoğrafları</Text>

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
    backgroundColor: "rgba(0,0,0,0.25)", // 🔥 Light mode için daha soft blur
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  modalBox: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",            // ⭐ PREMIUM BEYAZ
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",        // ⭐ İnce modern border
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",                    // ⭐ Hafif gölge
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",                       // ⭐ Koyu premium text
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
    borderColor: "rgba(0,0,0,0.15)",        // ⭐ Mat gri çizgi
    backgroundColor: "#F3F4F6",             // ⭐ Soft gri yüzey
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
    color: "#9CA3AF",                       // ⭐ Soft gri ikon
  },

  closeBtn: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#E5E7EB",             // ⭐ iOS-style açık gri buton
    borderRadius: 8,
    alignItems: "center",
  },

  closeText: {
    color: "#1C1C1E",                        // ⭐ Koyu premium yazı
    fontSize: 16,
    fontWeight: "600",
  },
});
