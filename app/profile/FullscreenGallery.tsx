import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type Props = {
  open: boolean;
  gallery: string[];
  onClose: () => void;
};

export default function FullscreenGallery({ open, gallery, onClose }: Props) {
  const visible = gallery.filter(Boolean);

  if (!open || visible.length === 0) return null;

  return (
    <Modal visible={open} transparent animationType="fade">
      <View style={styles.overlay}>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          {visible.map((url, i) => (
            <View key={i} style={styles.slide}>
              <Image
                source={{ uri: url }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",  // ⭐ Light tema için premium soft dark overlay
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    width: "100%",
    height: "100%",
  },

  scrollContent: {
    alignItems: "center",
  },

  slide: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  image: {
    width: "100%",
    height: "75%",
  },

  closeBtn: {
    position: "absolute",
    top: 75,
    right: 30,
    width: 28,
    height: 28,
    borderRadius: 24,
    backgroundColor: "#E5E7EB",  // ⭐ Premium gri buton
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  closeText: {
    color: "#1C1C1E",  // ⭐ Premium koyu text
    fontSize: 16,
    fontWeight: "600",
  },
});
