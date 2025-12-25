import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔔 SYSTEM + DM UNREAD
import { useDmUnreadCount } from "@/src/(hooks)/useDmUnreadCount";
import { useSystemInbox } from "@/src/(providers)/SystemInboxProvider";

export default function BottomBar() {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  

  const { unread: systemUnread } = useSystemInbox();
  const dmUnread = useDmUnreadCount();
  const totalUnread = systemUnread + dmUnread;
  // ❌ Best ekranında bottom bar yok (HOOKLARDAN SONRA)
  if (path === "/best") {
    return null;
  }

  const isTab = (href: string) =>
  path === href || path.startsWith(href + "/");

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: 65 + insets.bottom,
        },
      ]}
    >
      {/* 🏠 ANASAYFA (YENİ) */}
      <TouchableOpacity style={styles.tab} onPress={() => router.push("/home")}>
        <Text style={[styles.icon, isTab("/home") && styles.active]}>
          🏠
        </Text>
        <Text style={[styles.label, isTab("/home") && styles.active]}>
          Anasayfa
        </Text>
      </TouchableOpacity>

      {/* 📡 YAYINLAR (ESKİ / = AKTİF ODALAR) */}
      <TouchableOpacity style={styles.tab} onPress={() => router.push("/home/rooms")}>
        <Text style={[styles.icon, isTab("/") && styles.active]}>
          📡
        </Text>
        <Text style={[styles.label, isTab("/") && styles.active]}>
          Yayınlar
        </Text>
      </TouchableOpacity>

      {/* ✉️ MESAJLAR */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/messages")}
      >
        {totalUnread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalUnread}</Text>
          </View>
        )}

        <Text
          style={[styles.icon, isTab("/messages") && styles.active]}
        >
          ✉️
        </Text>

        <Text
          style={[styles.label, isTab("/messages") && styles.active]}
        >
          Mesajlar
        </Text>
      </TouchableOpacity>

      {/* 👤 PROFİL */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/profile")}
      >
        <Text
          style={[styles.icon, isTab("/profile") && styles.active]}
        >
          👤
        </Text>

        <Text
          style={[styles.label, isTab("/profile") && styles.active]}
        >
          Profilim
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingTop: 10,
    backgroundColor: "#F2F2F5",
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 999,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
  },

  icon: {
    fontSize: 22,
    color: "#7A7A7E",
    marginBottom: 2,
  },

  label: {
    fontSize: 12,
    color: "#7A7A7E",
  },

  active: {
    color: "#3b82f6",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: "red",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});
