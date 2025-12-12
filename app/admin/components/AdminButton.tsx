import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function AdminButton({ title, onPress }: any) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: "#2b2d42",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
