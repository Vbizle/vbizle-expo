import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoadHistoryTabs({
  value,
  onChange,
}: {
  value: "vb" | "dealer";
  onChange: (v: "vb" | "dealer") => void;
}) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.btn, value === "vb" && styles.active]}
        onPress={() => onChange("vb")}
      >
        <Text
          style={[
            styles.text,
            value === "vb" && styles.activeText,
          ]}
        >
          VB Yüklemeleri
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, value === "dealer" && styles.active]}
        onPress={() => onChange("dealer")}
      >
        <Text
          style={[
            styles.text,
            value === "dealer" && styles.activeText,
          ]}
        >
          Bayi Yüklemeleri
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 16,
  },
  btn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    marginHorizontal: 4,
  },
  active: {
    backgroundColor: "#EDE9FE",
    borderColor: "#7c3aed",
  },
  text: {
    fontSize: 14,
    color: "#374151",
  },
  activeText: {
    fontWeight: "700",
    color: "#7c3aed",
  },
});
