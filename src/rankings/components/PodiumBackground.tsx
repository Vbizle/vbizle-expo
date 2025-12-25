import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";

const PodiumBg = require("../../../assets/backgrounds/ranking-bg.png");

type Props = {
  children: React.ReactNode;
};

export default function PodiumBackground({ children }: Props) {
  return (
    <ImageBackground
      source={PodiumBg}
      resizeMode="contain"
      style={styles.bg}
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    width: "100%",
    aspectRatio: 3 / 2,   // 🔒 CİHAZ FARKINI BİTİREN NOKTA
    alignSelf: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: "14%", // avatarlar için sabit oransal alan
  },
});
