import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ⭐ SAFE AREA
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 🔔 SYSTEM + DM UNREAD
import { useDmUnreadCount } from "@/src/(hooks)/useDmUnreadCount";
import { useSystemInbox } from "@/src/(providers)/SystemInboxProvider";

export default function BottomBar() {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 🔹 SYSTEM UNREAD (VB, SVP, ROOT)
  const { unread: systemUnread } = useSystemInbox();

  // 🔹 DM UNREAD (normal mesajlar)
  const dmUnread = useDmUnreadCount();

  // 🔥 TOPLAM (ALT BAR SENKRON)
  const totalUnread = systemUnread + dmUnread;

  const isTab = (href: string) => path === href;

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
      {/* ANASAYFA */}
      <TouchableOpacity style={styles.tab} onPress={() => router.push("/")}>
        <Text style={[styles.icon, isTab("/") && styles.active]}>⬛</Text>
        <Text style={[styles.label, isTab("/") && styles.active]}>
          Anasayfa
        </Text>
      </TouchableOpacity>

      {/* MESAJLARIM */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/messages")}
      >
        {totalUnread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalUnread}</Text>
          </View>
        )}

        <Text style={[styles.icon, isTab("/messages") && styles.active]}>
          ✉️
        </Text>

        <Text style={[styles.label, isTab("/messages") && styles.active]}>
          Mesajlarım
        </Text>
      </TouchableOpacity>

      {/* PROFİL */}
      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/profile")}
      >
        <Text style={[styles.icon, isTab("/profile") && styles.active]}>
          👤
        </Text>

        <Text style={[styles.label, isTab("/profile") && styles.active]}>
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
    backgroundColor: "#F2F2F5",            // ⭐ Soft premium mat tabbar
    borderTopWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",       // ⭐ iOS-style soft border
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
    color: "#7A7A7E",                      // ⭐ Modern muted gray
    marginBottom: 2,
  },

  label: {
    fontSize: 12,
    color: "#7A7A7E",                      // ⭐ Premium muted gray
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
