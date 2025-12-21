import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SuperUserBadge() {
  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#f7d046", "#a855f7", "#3b82f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>SÜPER KULLANICI</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: "#facc15",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  gradient: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  text: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
});
