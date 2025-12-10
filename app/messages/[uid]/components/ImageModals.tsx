import React from "react";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";

export default function ImageModals({
  pendingImage,
  setPendingImage,
  uploadPendingImage,
  imageModal,
  setImageModal,
  styles,
}) {
  return (
    <>
      {/* 📌 Gönderilmemiş resim önizleme */}
      {pendingImage && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalBg}>
            <Image
              source={{ uri: pendingImage }}
              resizeMode="contain"
              style={styles.modalImg}
            />

            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                onPress={() => setPendingImage(null)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={uploadPendingImage}
                style={styles.sendImgBtn}
              >
                <Text style={styles.sendImgText}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* 📌 Büyük resim görüntüleme */}
      {imageModal && (
        <Modal visible transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalBg}
            onPress={() => setImageModal(null)}
          >
            <Image
              source={{ uri: imageModal }}
              resizeMode="contain"
              style={styles.modalImg}
            />
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}
