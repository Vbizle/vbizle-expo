import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function SystemHeader() {
  const router = useRouter();

  return (
    <View
      style={{
        paddingTop: 40,
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ fontSize: 20, marginRight: 12 }}>←</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/icon.png")}
        style={{ width: 38, height: 38, borderRadius: 19, marginRight: 10 }}
      />

      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "700", marginRight: 6 }}>
            VbTeam
          </Text>

          <View
            style={{
              backgroundColor: "#1d4ed8",
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, color: "#fff", fontWeight: "600" }}>
              SİSTEM
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: "#6E6E73" }}>
          Sistem mesajları
        </Text>
      </View>
    </View>
  );
}
