// app/_layout.tsx

import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { auth } from "@/firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// ⭐ DOĞRU PROVIDER PATH'LERİ
import AuthProvider from "@/src/(providers)/AuthProvider";
import { RoomProvider } from "@/src/(providers)/RoomProvider";
import ThemeProvider from "@/src/(providers)/ThemeProvider";
import { UiProvider } from "@/src/(providers)/UiProvider";

import BottomBar from "@/src/components/BottomBar";
import MiniRoomBubble from "@/src/components/MiniRoomBubble";

import { usePresence } from "@/src/(hooks)/usePresence";

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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#111827", opacity: 0.6, fontSize: 18 }}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <UiProvider>
        <AuthProvider>
          <RoomProvider>

            {/* ⭐ SAFE AREA: Beyaz tema */}
            <SafeAreaView
              style={{ flex: 1, backgroundColor: "#fff" }}
              edges={["left", "right", "bottom"]}
            >
              {/* ⭐ STATUS BAR — açık tema */}
              <StatusBar backgroundColor="#fff" barStyle="dark-content" />

              {/* HEADER */}
              {user && !isRoomPage && !isDMPage && !isAuthPage && (
                <View
                  style={{
                    width: "100%",
                    paddingTop: STATUS_HEIGHT,
                    paddingBottom: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderColor: "rgba(0,0,0,0.08)",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#111827",
                    }}
                  >
                    Vbizle
                  </Text>

                  <View style={{ flexDirection: "row", gap: 20 }}>
                    <Text
                      style={{ color: "#111827" }}
                      onPress={() => router.push("/")}
                    >
                      Ana Sayfa
                    </Text>
                    <Text
                      style={{ color: "#111827" }}
                      onPress={() => router.push("/rooms")}
                    >
                      Odalar
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
