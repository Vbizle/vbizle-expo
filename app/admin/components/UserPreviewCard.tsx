import { db } from "@/firebase/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

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

  const [saving, setSaving] = useState(false);

  const avatarUri =
    typeof preview.avatar === "string" && preview.avatar.trim()
      ? preview.avatar.trim()
      : FALLBACK_AVATAR;

  const role = preview.role ?? "user";

  /* ===============================
     BAYİ YAP / KALDIR
  =============================== */
  async function toggleDealer() {
    if (!myData || myData.role !== "root") return;
    if (!preview?.uid) return;

    const makeDealer = !preview.isDealer;

    Alert.alert(
      makeDealer ? "Bayi Yap" : "Bayi Kaldır",
      makeDealer
        ? "Bu kullanıcı bayi olarak atanacak. Emin misin?"
        : "Bu kullanıcının bayi yetkisi kaldırılacak. Emin misin?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Onayla",
          style: "destructive",
          onPress: async () => {
            try {
              setSaving(true);

              await updateDoc(doc(db, "users", preview.uid), {
                isDealer: makeDealer,
              });

              Alert.alert(
                "Başarılı",
                makeDealer
                  ? "Kullanıcı bayi yapıldı."
                  : "Kullanıcının bayi yetkisi kaldırıldı."
              );
            } catch (e) {
              Alert.alert("Hata", "İşlem yapılamadı.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }

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
          { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
          styles?.avatar,
        ]}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles?.previewName}>{preview.username}</Text>

        <Text
          style={[
            styles?.previewRole,
            role === "root" && { color: "#ef4444" },
            role === "dealer" && { color: "#2563eb" },
            role === "admin" && { color: "#7c3aed" },
            role === "system" && { color: "#6B7280" },
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

        {/* ===============================
            ROOT → BAYİ YAP / KALDIR BUTONU
        =============================== */}
        {myData?.role === "root" && (
          <TouchableOpacity
            onPress={toggleDealer}
            disabled={saving}
            style={{
              position: "absolute",
  top: 0,
  right: 0,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 81,
              backgroundColor: preview.isDealer ? "#ef4444" : "#2563eb",
              alignSelf: "flex-start",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
              {preview.isDealer ? "Bayi Kaldır" : "Bayi Yap"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
