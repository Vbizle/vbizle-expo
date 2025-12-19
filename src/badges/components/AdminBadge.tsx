import React from "react";
import { StyleSheet, Text } from "react-native";

export default function AdminBadge() {
  return <Text style={[styles.badge, { backgroundColor: "#DC2626" }]}>ADMIN</Text>;
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
