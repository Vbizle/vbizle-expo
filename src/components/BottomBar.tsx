import { usePathname, useRouter } from "expo-router";
import { collectionGroup, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../firebase/firebaseConfig";

// ⭐ SAFE AREA
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomBar() {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const unsub = onSnapshot(collectionGroup(db, "meta"), (snap) => {
      let total = 0;

      snap.forEach((d) => {
        const data = d.data();
        if (data?.unread?.[user.uid]) {
          total += data.unread[user.uid];
        }
      });

      setUnread(total);
    });

    return () => unsub();
  }, []);

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
      <TouchableOpacity style={styles.tab} onPress={() => router.push("/")}>
        <Text style={[styles.icon, isTab("/") && styles.active]}>⬛</Text>
        <Text style={[styles.label, isTab("/") && styles.active]}>
          Anasayfa
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tab}
        onPress={() => router.push("/messages")}
      >
        {unread > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}

        <Text style={[styles.icon, isTab("/messages") && styles.active]}>
          ✉️
        </Text>

        <Text style={[styles.label, isTab("/messages") && styles.active]}>
          Mesajlarım
        </Text>
      </TouchableOpacity>

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
