// app/_layout.tsx

import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

import AuthProvider from "@/src/(providers)/AuthProvider";
import { RoomProvider } from "@/src/(providers)/RoomProvider";
import { UiProvider } from "@/src/(providers)/UiProvider";

import BottomBar from "@/src/components/BottomBar";
import MiniRoomBubble from "@/src/components/MiniRoomBubble";

// ⭐ Presence hook
import { usePresence } from "@/src/(hooks)/usePresence";

// ⭐ YENİ — ThemeProvider ve useTheme import edildi
import { ThemeProvider, useTheme } from "@/src/(providers)/ThemeProvider";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  const [user, setUser] = useState<any>(undefined);
  const loading = user === undefined;

  const STATUS_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  usePresence();

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

  useEffect(() => {
    if (!loading && user === null && !isAuthPage) {
      router.replace("/login");
    }
  }, [loading, user, currentRoute]);

  useEffect(() => {
    if (!loading && user && isAuthPage) {
      router.replace("/");
    }
  }, [loading, user, currentRoute]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", opacity: 0.6, fontSize: 18 }}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  // ================================
  // ⭐ THEME WRAPPER BAŞLIYOR
  // ================================
  return (
    <ThemeProvider>
      <ThemedApp
        user={user}
        isRoomPage={isRoomPage}
        isDMPage={isDMPage}
        isAuthPage={isAuthPage}
        STATUS_HEIGHT={STATUS_HEIGHT}
      />
    </ThemeProvider>
  );
}

// =====================================================
//  THEMED UYGULAMA KATMANI (TEMA RENKLERİNİ UYGULAR)
// =====================================================
function ThemedApp({ user, isRoomPage, isDMPage, isAuthPage, STATUS_HEIGHT }) {
  const { colors } = useTheme(); // ⭐ RENKLER BURADAN GELİYOR

  return (
    <UiProvider>
      <AuthProvider>
        <RoomProvider>
          {/* SAFE AREA */}
          <SafeAreaView
            style={{ flex: 1, backgroundColor: colors.background }}
            edges={["left", "right", "bottom"]}
          >
            <StatusBar
              backgroundColor={colors.background}
              barStyle={colors.text === "#000" ? "dark-content" : "light-content"}
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

            {/* SAYFA İÇERİĞİ */}
            <View style={{ flex: 1 }}>
              <Slot />
            </View>

            {/* KÜÇÜK ODA BALONU */}
            <MiniRoomBubble />

            {/* ALT BAR */}
            {user && !isRoomPage && !isDMPage && !isAuthPage && (
              <BottomBar />
            )}
          </SafeAreaView>
        </RoomProvider>
      </AuthProvider>
    </UiProvider>
  );
}
