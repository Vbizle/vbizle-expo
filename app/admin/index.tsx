import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import AdminButton from "./components/AdminButton";
import AdminHeader from "./components/AdminHeader";

// 🔹 YENİ EKLENENLER
import RootAnnouncementModal from "@/app/system/components/RootAnnouncementModal";
import { sendRootAnnouncement } from "@/app/system/services/rootAnnouncementService";
import { storage } from "@/firebase/firebaseConfig";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";



export default function AdminDashboard() {
  const router = useRouter();

  // 🔹 YENİ STATE (MEVCUDA DOKUNMADAN)
  const [showRootModal, setShowRootModal] = useState(false);
  const [rootTitle, setRootTitle] = useState("");
  const [rootBody, setRootBody] = useState("");

  return (
    <View style={styles.container}>
      <AdminHeader />

      <AdminButton
        title="VB Bakiye Yükle"
        onPress={() => router.push("/admin/load-balance")}
      />

      <AdminButton
        title="Kullanıcılar"
        onPress={() => router.push("/admin/users")}
      />

      <AdminButton
        title="Oda Yönetimi"
        onPress={() => router.push("/admin/rooms")}
      />

      {/* 🔹 MEVCUT */}
      <AdminButton
        title="Çekim Talepleri"
        onPress={() => router.push("/admin/withdraw")}
      />

      {/* 🔹 YENİ — ROOT SİSTEM DUYURUSU */}
      <AdminButton
        title="📢 Sistem Duyurusu Gönder"
        onPress={() => setShowRootModal(true)}
      />

      {/* 🔹 ROOT DUYURU MODALI */}
     <RootAnnouncementModal
  visible={showRootModal}
  title={rootTitle}
  body={rootBody}
  onChangeTitle={setRootTitle}
  onChangeBody={setRootBody}
  onClose={() => setShowRootModal(false)}
  onSend={async ({ imageUri, roomId }) => {
    if (!rootTitle || !rootBody) return;

    try {
      let imageUrl: string | undefined;

      if (imageUri) {
        const res = await fetch(imageUri);
        const blob = await res.blob();

        const fileRef = storageRef(
          storage,
          `announcements/root/${Date.now()}.jpg`
        );

        await uploadBytes(fileRef, blob);
        imageUrl = await getDownloadURL(fileRef);
      }

      await sendRootAnnouncement({
        title: rootTitle,
        body: rootBody,
        imageUrl,
        roomId: roomId || undefined,
      });

      setRootTitle("");
      setRootBody("");
      setShowRootModal(false);
    } catch (e) {
      console.log("ROOT ANNOUNCEMENT ERROR", e);
    }
  }}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
});
