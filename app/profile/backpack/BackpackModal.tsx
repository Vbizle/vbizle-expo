import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatusTab from "./StatusTab";



type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function BackpackModal({ visible, onClose }: Props) {
  return (
    <Modal
  visible={visible}
  animationType="slide"
  onRequestClose={onClose}   // 🔥 ANDROID BACK FIX
>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Sırt Çantam</Text>

          <View style={{ width: 32 }} />
        </View>

        {/* CONTENT */}
       <View style={styles.content}>
  <StatusTab />
</View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  back: {
    width: 32,
  },
  backText: {
    fontSize: 28,
    fontWeight: "700",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 14,
  },
});
