import NearbyUserCard from "@/src/home/components/NearbyUserCard";
import { useDiscoverOnlineUsers } from "@/src/home/hooks/useDiscoverOnlineUsers";
import { useNearbyOnlineUsers } from "@/src/home/hooks/useNearbyOnlineUsers";
import { useNewUsers } from "@/src/home/hooks/useNewUsers";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

export default function Home() {
  const nearbyUsers = useNearbyOnlineUsers();
  const discoverUsers = useDiscoverOnlineUsers();
  const newUsers = useNewUsers();

  // ✅ Varsayılan KEŞFET (değişmedi)
  const [tab, setTab] = useState<"nearby" | "discover" | "new">("discover");

  const users = useMemo(() => {
    return tab === "nearby"
      ? nearbyUsers
      : tab === "discover"
      ? discoverUsers
      : newUsers;
  }, [tab, nearbyUsers, discoverUsers, newUsers]);

  const emptyText =
    tab === "nearby"
      ? "Yakınlarda çevrimiçi kullanıcı yok"
      : tab === "discover"
      ? "Keşfet'te çevrimiçi kullanıcı yok"
      : "Henüz yeni üye yok";

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ ÜST SEKME BAR (Keşfet / Yakındakiler / Yeni Üyeler) */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 12,
          marginTop: 12,
          marginBottom: 8,
          backgroundColor: "#e5e7eb",
          borderRadius: 14,
          padding: 4,
        }}
      >
        {/* 🔍 KEŞFET */}
        <Pressable
          onPress={() => setTab("discover")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: tab === "discover" ? "#ffffff" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "800", opacity: tab === "discover" ? 1 : 0.6 }}>
            Keşfet
          </Text>
        </Pressable>

        {/* 📍 YAKINDAKİLER */}
        <Pressable
          onPress={() => setTab("nearby")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: tab === "nearby" ? "#ffffff" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "800", opacity: tab === "nearby" ? 1 : 0.6 }}>
            Yakındakiler
          </Text>
        </Pressable>

        {/* 🆕 YENİ ÜYELER */}
        <Pressable
          onPress={() => setTab("new")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: tab === "new" ? "#ffffff" : "transparent",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "800", opacity: tab === "new" ? 1 : 0.6 }}>
            Yeni Üyeler
          </Text>
        </Pressable>
      </View>

      {/* ✅ LİSTE (AYNI KART, AYNI FLATLIST → SCROLL AKTİF) */}
      {users.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 40, opacity: 0.6 }}>
          {emptyText}
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(i) => i.uid}
          renderItem={({ item }) => <NearbyUserCard user={item} />}
          contentContainerStyle={{ paddingBottom: 75 }}
        />
      )}
    </View>
  );
}
