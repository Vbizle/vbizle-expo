import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function LoadHistoryRow({ item }: { item: any }) {
  if (!item || !item.toUser) return null;

  let rawDate: number | null = null;

  // 🔹 Date.now()
  if (typeof item.createdAt === "number") {
    rawDate = item.createdAt;
  }

  // 🔹 Firestore Timestamp
  else if (item.createdAt?.seconds) {
    rawDate = item.createdAt.seconds * 1000;
  }

  // 🔹 legacy
  else if (typeof item.date === "number") {
    rawDate = item.date;
  }

  const dateText = rawDate
    ? new Date(rawDate).toLocaleString("tr-TR")
    : null;

  return (
    <View style={styles.row}>
      <Image source={{ uri: item.toUser.avatar }} style={styles.avatar} />

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.toUser.username}</Text>

        <Text style={styles.sub}>
          {item.source === "dealer"
            ? "Bayi yükledi"
            : item.source === "root_dealer"
            ? "Root → Bayi Cüzdanı"
            : "Root yükledi"}
        </Text>

        <Text style={styles.subSmall}>
          Yükleyen: {item.admin?.username ?? "Root"}
        </Text>

        {/* ✅ ARTIK YENİ + ESKİ HER ŞEY GÖRÜNÜR */}
        {dateText && <Text style={styles.date}>{dateText}</Text>}
      </View>

      <Text style={styles.amount}>+{item.amount} VB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  name: {
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#6B7280",
  },
  subSmall: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  amount: {
    color: "#16a34a",
    fontWeight: "700",
  },
});
