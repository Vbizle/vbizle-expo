import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function SystemMessageItem({ item }: any) {
  const router = useRouter();

  // ---- TYPE NORMALIZE ----
  const t = String(item?.type || "").toLowerCase();

  const isVB =
    t === "vb_load" ||
    t === "vb_loaded" ||
    t === "vbload" ||
    t === "vb";

  const isSVP = t.startsWith("svp");

  const isAnnouncement =
    t === "root" ||
    t === "announcement" ||
    item?.meta?.from === "ROOT";

  const bgColor = isAnnouncement
    ? "#EFF6FF"
    : isSVP
    ? "#F5F3FF"
    : "#F8FAFC";

  const icon = isAnnouncement ? "📣" : isSVP ? "⭐" : isVB ? "✓" : "✓";
  const title = isAnnouncement ? "Sistem Duyurusu" : item?.title;

  // ---- META ----
  const imageUrl = item?.meta?.imageUrl || null;
  const roomId = item?.meta?.roomId || null;
  const action = item?.meta?.action || null;

  return (
    <View
      style={{
        backgroundColor: bgColor,
        padding: 14,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* HEADER */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
  <Text
    style={{
      marginRight: 6,

      // 🔥 SADECE VB BÜYÜK + YEŞİL
      fontSize: isVB ? 20 : isAnnouncement ? 16 : 17,
      fontWeight: isVB ? "900" : "700",
      color: isVB
        ? "#10B981"        // ✅ premium yeşil (VB)
        : isAnnouncement
        ? "#2563EB"        // 📣 duyuru mavi
        : "#7C3AED",       // ⭐ SVP mor
    }}
  >
    {icon}
  </Text>

  <Text
    style={{
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    }}
  >
    {title}
  </Text>
</View>
      {/* 🖼️ AFİŞ */}
      {imageUrl && (
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => {
      if (action === "JOIN_ROOM" && roomId) {
        router.push(`/rooms/${roomId}`);
      }
    }}
    style={{
      width: "100%",
      aspectRatio: 16 / 9,     // 🔥 DİKDÖRTGEN BANNER ORANI
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "#e5e7eb",
      marginBottom: 12,
    }}
  >
    <Image
      source={{ uri: imageUrl }}
      style={{
        width: "100%",
        height: "100%",
      }}
      resizeMode="cover"       // 🔥 TAM DOLDURUR
    />
  </TouchableOpacity>
)}

      {/* METİN */}
      <Text
  style={{
    fontSize: isAnnouncement ? 15 : 16.5,        // 🔥 ROOT biraz daha büyük
    fontWeight: isAnnouncement ? "700" : "400", // 🔥 ROOT KALIN
    color: isAnnouncement ? "#020617" : "#475569",
    lineHeight: 20,
  }}
>
  {item?.body}
</Text>

      {/* 🚪 ODAYA GİT */}
      {action === "JOIN_ROOM" && roomId && (
        <TouchableOpacity
          onPress={() => router.push(`/rooms/${roomId}`)}
          style={{
            marginTop: 12,
            paddingVertical: 10,
            borderRadius: 10,
            backgroundColor: "#2563eb",
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            🚪 Odaya Git
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
