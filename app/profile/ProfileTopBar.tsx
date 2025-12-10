import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  onLogout: () => void;
};

export default function ProfileTopBar({ onLogout }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <Text style={styles.title}>Profil</Text>

      {/* Menü Butonu */}
      <TouchableOpacity onPress={() => setMenuOpen((prev) => !prev)}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Açılır Menü */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            onPress={() => {
              setMenuOpen(false);
              onLogout();
            }}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 380,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
    paddingHorizontal: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E", // ⭐ premium koyu metin
  },

  menuIcon: {
    fontSize: 28,
    color: "#1C1C1E", // ⭐ light mod için uygun ikon
  },

  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#FFFFFF", // ⭐ Mat beyaz kutu
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)", // ⭐ soft light border
    borderRadius: 12,
    padding: 12,
    width: 150,
    zIndex: 50,

    // ⭐ premium floating shadow
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  logoutBtn: {
    paddingVertical: 6,
  },

  logoutText: {
    color: "#DC2626", // ⭐ premium kırmızı
    fontSize: 14,
    fontWeight: "600",
  },
});
