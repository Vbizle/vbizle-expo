import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DmOptionsModal({
  visible,
  onClose,
  onPin,
  onDelete,
  onBlock,
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.bg}>
        <View style={styles.card}>

          <TouchableOpacity style={styles.btn} onPress={onPin}>
            <Text style={styles.text}>Başa sabitle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={onDelete}>
            <Text style={[styles.text, { color: "#dc2626" }]}>
              Mesajlaşmayı sil
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btn} onPress={onBlock}>
            <Text style={[styles.text, { color: "#dc2626" }]}>Engelle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={[styles.text, { fontWeight: "600" }]}>İptal</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
  },
  btn: {
    paddingVertical: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
  },
  cancelBtn: {
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 16,
    color: "#1C1C1E",
  },
});
