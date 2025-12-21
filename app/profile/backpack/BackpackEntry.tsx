import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onPress: () => void;
};

export default function BackpackEntry({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <LinearGradient
        colors={["#f3f4f6", "#e5e7eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <View style={styles.left}>
          <Text style={styles.icon}>🎒</Text>
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Sırt Çantam</Text>
          <Text style={styles.subtitle}>
            Sahip olduklarım
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
  width: "100%",
  paddingHorizontal: 16,   // 🔑 EN İYİLER İLE AYNI
  marginTop: 10,
},
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
  },
  left: {
    width: 32,
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
    marginLeft: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: "#6B7280",
  },
});
