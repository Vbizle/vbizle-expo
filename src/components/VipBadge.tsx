// src/components/VipBadge.tsx

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { VipRank } from "../utils/vipSystem";

type Props = {
  rank: VipRank;
  size?: "small" | "medium";
};

export default function VipBadge({ rank, size = "medium" }: Props) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: rank.color },
        size === "small" ? styles.small : styles.medium,
      ]}
    >
      <Text style={styles.text}>{rank.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "700",
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ scale: 0.85 }],
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
