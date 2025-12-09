import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
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

        {/* Scrollable horizontal fullscreens */}
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

        {/* Kapatma Butonu */}
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
    backgroundColor: "rgba(0,0,0,0.9)",
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
    height: "100%",
  },

  closeBtn: {
    position: "absolute",
    top: 32,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "white",
    fontSize: 28,
  },
});
