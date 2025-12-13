import React from "react";
import { Image, Text, View } from "react-native";

const FALLBACK_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function UserPreviewCard({
  preview,
  myData,
  styles,
}: {
  preview: any;
  myData: any;
  styles: any;
}) {
  if (!preview || preview.notFound) return null;

  const avatarUri =
    typeof preview.avatar === "string" && preview.avatar.trim()
      ? preview.avatar.trim()
      : FALLBACK_AVATAR;

  const role = preview.role ?? "user";

  return (
    <View
      style={[
        { flexDirection: "row", alignItems: "center" },
        styles?.previewCard,
      ]}
    >
      <Image
        source={{ uri: avatarUri }}
        style={[
          // ✅ styles.avatar yoksa bile Image görünür
          { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
          styles?.avatar,
        ]}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles?.previewName}>{preview.username}</Text>

        <Text
          style={[
            styles?.previewRole,
            role === "root" && { color: "#ef4444" },   // Root kırmızı
            role === "dealer" && { color: "#2563eb" }, // Bayi mavi
            role === "admin" && { color: "#7c3aed" },  // Admin mor
            role === "system" && { color: "#6B7280" }, // Sistem gri
          ]}
        >
          {role === "root"
            ? "Root"
            : role === "dealer"
            ? "Bayi"
            : role === "admin"
            ? "Admin"
            : role === "system"
            ? "Sistem"
            : role}
        </Text>

        <Text style={styles?.previewId}>{preview.vbId}</Text>

        {myData?.role === "root" && (
          <Text style={{ fontSize: 12 }}>
            Normal Bakiye: {preview.vbBalance} VB
          </Text>
        )}

        {preview.isDealer && myData?.role === "root" && (
          <Text style={{ fontSize: 12, color: "#7c3aed" }}>
            Bayi Bakiye: {preview.dealerWallet} VB
          </Text>
        )}
      </View>
    </View>
  );
}
