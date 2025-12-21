import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  onPress: () => void;
};

export default function BackpackButton({ onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.icon}>🎒</Text>
      <Text style={styles.text}>Statüm</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  icon: { fontSize: 16 },
  text: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
});
