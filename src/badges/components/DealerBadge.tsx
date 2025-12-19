import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MoneyBagIcon from "../icons/MoneyBagIcon";

export default function DealerBadge() {
  return (
    <LinearGradient
      colors={[
        "#F6E27A", // parlak altın
        "#C9A13D", // ana metal
        "#8A6A18", // derinlik
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badge}
    >
      <View style={styles.inner}>
        <MoneyBagIcon size={12} />
        <Text style={styles.text}>BAYİ</Text>
      </View>

      {/* ✨ metalik parlama */}
      <View style={styles.gloss} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,

    borderWidth: 0.6,
    borderColor: "rgba(255,255,255,0.45)",

    shadowColor: "#000",
    shadowOpacity: 0.32,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 3,

    overflow: "hidden",
  },

  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  text: {
    color: "#2B1A00",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.35,

    textShadowColor: "rgba(255,255,255,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
});
