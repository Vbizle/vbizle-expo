import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function AdminHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Admin Paneli</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
});
