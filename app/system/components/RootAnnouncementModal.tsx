import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  title: string;
  body: string;

  // mevcutlar
  onChangeTitle: (v: string) => void;
  onChangeBody: (v: string) => void;
  onClose: () => void;

  // 🔥 GÜNCELLENDİ
  onSend: (payload: {
  imageUri?: string | null;
  roomId?: string | null;
}) => void;
};

export default function RootAnnouncementModal({
  visible,
  title,
  body,
  onChangeTitle,
  onChangeBody,
  onClose,
  onSend,
}: Props) {
   // 🔥🔥🔥 LOG 1 — MODAL RENDER ANINDA
  console.log("🧩 ROOT MODAL RENDER");
  console.log("🧩 typeof onSend:", typeof onSend);
  console.log("🧩 onSend value:", onSend);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string>("");

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "800", marginBottom: 12 }}>
            📢 Sistem Duyurusu
          </Text>

          {/* BAŞLIK */}
          <TextInput
            placeholder="Başlık"
            value={title}
            onChangeText={onChangeTitle}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
            }}
          />

          {/* MESAJ */}
          <TextInput
            placeholder="Mesaj"
            value={body}
            onChangeText={onChangeBody}
            multiline
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              padding: 10,
              height: 90,
              marginBottom: 10,
            }}
          />

          {/* 🖼️ AFİŞ SEÇ */}
          <TouchableOpacity
            onPress={async () => {
              const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.9,
              });

              if (!res.canceled) {
                setImageUri(res.assets[0].uri);
              }
            }}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: "#f1f5f9",
              marginBottom: 8,
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              🖼️ Afiş Seç (opsiyonel)
            </Text>
          </TouchableOpacity>

          {/* AFİŞ ÖNİZLEME */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: "100%",
                height: 140,
                borderRadius: 10,
                marginBottom: 8,
              }}
              resizeMode="cover"
            />
          )}

          {/* 🚪 ODA ID */}
          <TextInput
            placeholder="Hedef Oda ID (opsiyonel)"
            value={roomId}
            onChangeText={setRoomId}
            style={{
              borderWidth: 1,
              borderColor: "#e5e7eb",
              borderRadius: 8,
              padding: 10,
              marginBottom: 12,
            }}
          />

          {/* BUTONLAR */}
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <TouchableOpacity
              onPress={() => {
                setImageUri(null);
                setRoomId("");
                onClose();
              }}
              style={{ marginRight: 12 }}
            >
              <Text style={{ color: "#6b7280" }}>Vazgeç</Text>
            </TouchableOpacity>

           <TouchableOpacity
  onPress={() => {
    console.log("🔥 MODAL GÖNDER TIKLANDI");
    console.log("🔥 MODAL IMAGE URI:", imageUri);
    console.log("🔥 MODAL ROOM ID:", roomId);
    console.log("🔥 typeof onSend:", typeof onSend);

if (typeof onSend !== "function") {
  console.error("❌ onSend FUNCTION DEĞİL! MODAL BURADAN ÇAĞRILDI");
  return;
}


    onSend({
      imageUri,
      roomId: roomId || null,
    });

    setImageUri(null);
    setRoomId("");
  }}
>
              <Text style={{ color: "#2563eb", fontWeight: "700" }}>
                Gönder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
