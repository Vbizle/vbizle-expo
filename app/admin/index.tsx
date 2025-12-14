import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import AdminButton from "./components/AdminButton";
import AdminHeader from "./components/AdminHeader";

export default function AdminDashboard() {
  const router = useRouter();

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

      {/* 🔹 YENİ */}
      <AdminButton
        title="Çekim Talepleri"
        onPress={() => router.push("/admin/withdraw")}
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
