import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

export default function ChatsScreen() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Projede zaten çalışan DM listesi /messages
    // (stack'e eklemek yerine replace, geri tuşu çakışmasın)
    router.replace("/messages");
  }, []);

  // Çok kısa bir fallback (bazı cihazlarda flicker olmasın diye)
  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F5", alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#6E6E73" }}>Yükleniyor…</Text>
    </View>
  );
}
