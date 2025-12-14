import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import styles from "../styles";

type Props = {
  activeTab: "dealer" | "root";
  setActiveTab: (v: "dealer" | "root") => void;
  dealerWallet?: number;
  formatVB: (value: number) => string;
};

export default function DealerHeader({
  activeTab,
  setActiveTab,
  dealerWallet,
  formatVB,
}: Props) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "dealer" && styles.tabActive]}
          onPress={() => setActiveTab("dealer")}
        >
          <Text>Yüklemelerim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "root" && styles.tabActive]}
          onPress={() => setActiveTab("root")}
        >
          <Text>Satın Alımlarım</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.dealerBalance}>
        Bayi Bakiye: {formatVB(dealerWallet ?? 0)} VB
      </Text>
    </View>
  );
}
