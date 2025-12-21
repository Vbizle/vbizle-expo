import { auth } from "@/firebase/firebaseConfig";
import { purchaseStatus } from "@/src/premium/premiumService";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MarketStatusCard({ item }: any) {
  const uid = auth.currentUser?.uid;

  async function buy() {
    if (!uid) return;

    Alert.alert(
      "Onay",
      `${item.title} satın alınsın mı?`,
      [
        { text: "Vazgeç" },
        {
          text: "Satın Al",
          onPress: async () => {
            await purchaseStatus(uid, item);
          },
        },
      ]
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.sub}>
        Süre: {item.durationDays} gün
      </Text>
      <Text style={styles.price}>{item.priceVb} VB</Text>

      <TouchableOpacity onPress={buy} style={styles.btn}>
        <Text style={styles.btnText}>Satın Al</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: "800" },
  sub: { fontSize: 12, color: "#6B7280", marginVertical: 4 },
  price: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  btn: {
    backgroundColor: "#4F46E5",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#FFF", fontWeight: "800" },
});
