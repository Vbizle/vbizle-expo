import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MarketStatusTab from "./tabs/MarketStatusTab";
import FrameMarketTab from "./tabs/FrameMarketTab";
import EnterEffectMarketTab from "./tabs/EnterEffectMarketTab";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type MarketTab = "premium" | "frame" | "svga";

export default function MarketModal({ visible, onClose }: Props) {
  const [tab, setTab] = useState<MarketTab>("premium");

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Market</Text>
          <View style={{ width: 32 }} />
        </View>

        {/* TAB BAR */}
        <View style={styles.tabBar}>
          <TabButton
            label="Premium"
            active={tab === "premium"}
            onPress={() => setTab("premium")}
          />
          <TabButton
            label="Çerçeve"
            active={tab === "frame"}
            onPress={() => setTab("frame")}
          />
          <TabButton
            label="Giriş Efekti"
            active={tab === "svga"}
            onPress={() => setTab("svga")}
          />
        </View>

        {/* CONTENT */}
        <View style={{ flex: 1 }}>
          {tab === "premium" && <MarketStatusTab />}
          {tab === "frame" && <FrameMarketTab />}
          {tab === "svga" && <EnterEffectMarketTab />}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

/* 🔹 Tab Button */
function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabBtnActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },

  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  back: { width: 32 },
  backText: { fontSize: 22, fontWeight: "700" },
  title: { fontSize: 16, fontWeight: "800" },

  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  tabTextActive: {
    color: "#2563EB",
    fontWeight: "800",
  },
});
