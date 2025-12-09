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

import { usePresence } from "@/src/(hooks)/usePresence";

// ⭐ YENİ — THEME PROVIDER IMPORT
import ThemeProvider from "@/src/(providers)/ThemeProvider";

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

  return (
    // ⭐ THEME PROVIDER ARTIK EN DIŞTA
    <ThemeProvider>
      <UiProvider>
        <AuthProvider>
          <RoomProvider>

            <SafeAreaView
              style={{ flex: 1, backgroundColor: "black" }}
              edges={["left", "right", "bottom"]}
            >
              <StatusBar backgroundColor="#000" barStyle="light-content" />

              {/* HEADER */}
              {user && !isRoomPage && !isDMPage && !isAuthPage && (
                <View
                  style={{
                    width: "100%",
                    paddingTop: STATUS_HEIGHT,
                    paddingBottom: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderColor: "rgba(255,255,255,0.1)",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    Vbizle
                  </Text>

                  <View style={{ flexDirection: "row", gap: 20 }}>
                    <Text style={{ color: "white" }} onPress={() => router.push("/")}>
                      Ana Sayfa
                    </Text>
                    <Text style={{ color: "white" }} onPress={() => router.push("/rooms")}>
                      Odalar
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Slot />
              </View>

              <MiniRoomBubble />

              {user && !isRoomPage && !isDMPage && !isAuthPage && (
                <BottomBar />
              )}
            </SafeAreaView>

          </RoomProvider>
        </AuthProvider>
      </UiProvider>
    </ThemeProvider>
  );
}
