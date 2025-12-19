import React from "react";
import { StyleSheet, Text } from "react-native";

export default function SvipBadge() {
  return <Text style={[styles.badge, { backgroundColor: "#7C3AED" }]}>SVIP</Text>;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    color: "#fff",
    fontSize: 9,
    fontWeight: "800",
  },
});
