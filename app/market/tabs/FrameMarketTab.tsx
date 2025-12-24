import { useMarketItems } from "@/src/market-items/hooks/useMarketItems";
import { purchaseMarketItem } from "@/src/market-items/services/purchaseMarketItem";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FrameMarketTab() {
  const { items, loading } = useMarketItems("frame");

  if (loading) {
    return <Text style={styles.loading}>Yükleniyor...</Text>;
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
         onPress={async () => {
  try {
    console.log("🟢 Frame satın alma tıklandı:", item.id);

    await purchaseMarketItem({
      itemType: "frame",
      itemId: item.id,
    });

    alert("Çerçeve satın alındı 🎉");
  } catch (err: any) {
    console.error("❌ Satın alma hatası:", err);
    alert(err?.message || "Satın alma başarısız");
  }
}}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.price}>{item.priceVb} VB</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  loading: {
    padding: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
  },
  price: {
    marginTop: 4,
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "600",
  },
});
