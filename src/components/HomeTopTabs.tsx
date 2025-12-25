import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  currentRoute: string;
  onNavigate: (route: string) => void;
};

export default function HomeTopTabs({ currentRoute, onNavigate }: Props) {
  const isActive = (key: "follow" | "popular" | "discover") =>
    currentRoute === "/home" && key === "discover";

  return (
    <View style={styles.container}>
      {/* SOL SEKME GRUBU */}
      <View style={styles.leftTabs}>
        <Pressable onPress={() => onNavigate("/home")} style={styles.tab}>
          <Text style={[styles.text, isActive("follow") && styles.active]}>
            Takip et
          </Text>
        </Pressable>

        <Pressable onPress={() => onNavigate("/home")} style={styles.tab}>
          <Text style={[styles.text, isActive("popular") && styles.active]}>
            Popüler
          </Text>
        </Pressable>

        <Pressable onPress={() => onNavigate("/home")} style={styles.tab}>
          <Text style={[styles.text, styles.active]}>
            Keşfet
          </Text>
        </Pressable>
      </View>

      {/* SAĞ AKSİYONLAR */}
      <View style={styles.rightActions}>
       {/* 🏆 KUPA */}
<Pressable
  onPress={() => onNavigate("/best")}
  style={styles.iconBtn}
>
  <Text style={styles.trophy}>🏆</Text>
</Pressable>

        {/* 🎥 ODA AÇ */}
        <Pressable
          onPress={() => onNavigate("/create-room")}
          style={styles.iconBtn}
        >
          <Ionicons
            name="videocam-outline"
            size={22}
            color="#111827"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },

  leftTabs: {
    flexDirection: "row",
    gap: 22,
    flex: 1, // 👈 kupayı sağa iter
  },

  tab: {
    justifyContent: "center",
  },

  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "#9ca3af",
  },

  active: {
    color: "#111827",
  },

  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  trophy: {
    fontSize: 20,
  },
});
