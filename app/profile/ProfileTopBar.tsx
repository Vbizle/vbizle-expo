import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
      <TouchableOpacity
        onPress={() => setMenuOpen((prev) => !prev)}
      >
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
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },

  menuIcon: {
    fontSize: 26,
    color: "white",
  },

  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    width: 150,
    zIndex: 50,
  },

  logoutBtn: {
    paddingVertical: 6,
  },

  logoutText: {
    color: "#f87171",
    fontSize: 14,
  },
});
