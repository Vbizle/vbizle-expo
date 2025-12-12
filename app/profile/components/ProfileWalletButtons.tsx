import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileWalletButtons() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Bakiyem */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/profile/wallet")}
      >
        <Text style={styles.cardTitle}>Bakiyem</Text>
      </TouchableOpacity>

      {/* Varlıklarım */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/profile/assets")}
      >
        <Text style={styles.cardTitle}>Varlıklarım</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "72%",
    marginTop: 45,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    paddingVertical: 4,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000c0",
  },
});
