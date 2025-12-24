 // app/_layout.tsx

import { Redirect, Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Providers
import AuthProvider from "@/src/(providers)/AuthProvider";
import { RoomProvider } from "@/src/(providers)/RoomProvider";
import ThemeProvider, { useTheme } from "@/src/(providers)/ThemeProvider";
import { UiProvider } from "@/src/(providers)/UiProvider";

// ⭐ YENİ EKLENDİ — GLOBAL VIP + LEVEL Canlı Veri
import { UserLiveDataProvider } from "@/src/(providers)/UserLiveDataProvider";

// Components
import BottomBar from "@/src/components/BottomBar";
import MiniRoomBubble from "@/src/components/MiniRoomBubble";

// Hooks
import { usePresence } from "@/src/(hooks)/usePresence";
import { SystemInboxProvider } from "@/src/(providers)/SystemInboxProvider";
import { useLocationAfterAuth } from "../location";
import "../location/locationTask";




function LayoutInner() {
  const router = useRouter();
  const segments = useSegments();

  const { colors, theme } = useTheme();

  const [user, setUser] = useState<any>(undefined);
  const loading = user === undefined;

  const STATUS_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  usePresence();
  useLocationAfterAuth();
   // 🔥 SADECE DEBUG İÇİN — BURAYA EKLE
  useEffect(() => {
  const t = setTimeout(() => {
    console.log("🔥 FORCE reset + startLocationTracking()");

    import("../location/locationService").then((m) => {
      m.resetLocationTask().then(() => {
        m.startLocationTracking();
      });
    });
  }, 3000);

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const currentRoute = "/" + segments.join("/");

  const isAuthPage =
    currentRoute === "/login" || currentRoute === "/register";

  const isRoomPage =
    currentRoute.startsWith("/rooms") || currentRoute === "/create-room";

  const isDMPage =
    currentRoute.startsWith("/messages/") &&
    currentRoute.split("/").length === 3;
const isSystemPage = currentRoute.startsWith("/system");

  // ------------------------------------------------------------
  // AUTH GUARD
  // ------------------------------------------------------------
  if (!loading && !user && !isAuthPage) {
    return <Redirect href="/login" />;
  }

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.backgroundSoft,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text, opacity: 0.6, fontSize: 18 }}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.backgroundSoft }}
      edges={["left", "right", "bottom"]}
    >
      <StatusBar
        backgroundColor={colors.backgroundSoft}
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />

      {/* HEADER */}
      {user && !isRoomPage && !isDMPage && !isAuthPage && (
        <View
          style={{
            width: "100%",
            paddingTop: STATUS_HEIGHT,
            paddingBottom: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: colors.backgroundSoft,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            Vbizle
          </Text>

          <View style={{ flexDirection: "row", gap: 20 }}>
            <Text
              style={{ color: colors.text }}
              onPress={() => router.push("/")}
            >
              Ana Sayfa
            </Text>
            <Text
              style={{ color: colors.text }}
              onPress={() => router.push("/rooms")}
            >
              Odalar
            </Text>
          </View>
        </View>
      )}

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <Slot />
      </View>

      <MiniRoomBubble />

      {user &&
  !isRoomPage &&
  !isDMPage &&
  !isSystemPage &&
  !isAuthPage && <BottomBar />}
    </SafeAreaView>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <UiProvider>
        <AuthProvider>

          {/* ⭐ GLOBAL VIP + LEVEL CANLI SİSTEM */}
          <UserLiveDataProvider>

             <SystemInboxProvider>

              <RoomProvider>
                <LayoutInner />
              </RoomProvider>

            </SystemInboxProvider>

          </UserLiveDataProvider>

        </AuthProvider>
      </UiProvider>
    </ThemeProvider>
  );
}