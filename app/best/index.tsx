import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import RankingRow from "@/src/rankings/components/RankingRow";
import TopThreePodium from "@/src/rankings/components/TopThreePodium";
import { useRanking } from "@/src/rankings/hooks/useRanking";
import { useRankingUsers } from "@/src/rankings/hooks/useRankingUsers";
import { useRouter } from "expo-router";


type TopTab = "supporters" | "broadcasters";
type PeriodTab = "daily" | "weekly" | "monthly";

export default function BestScreen() {
   const router = useRouter();   // ⬅️ EKLE
  const [topTab, setTopTab] = useState<TopTab>("supporters");
  const [period, setPeriod] = useState<PeriodTab>("daily");

  const { data, loading } = useRanking(topTab, period);

  // 🔥 UI GÜVENLİ LİMİT
  const list = useMemo(() => {
    return (data?.list ?? []).slice(0, 25);
  }, [data]);
const topThree = useMemo(() => list.slice(0, 3), [list]);
const restList = useMemo(() => list.slice(3), [list]);
  // 🔥 UID listesi
  const uids = useMemo(() => list.map((i) => i.uid), [list]);

  // 🔥 UID → user map
  const usersMap = useRankingUsers(uids);

 return (
  <ImageBackground
    source={require("@/assets/backgrounds/ranking-bg.png")}
    style={styles.container}
    resizeMode="cover"
  >
    <View style={styles.headerRow}>
  <Pressable onPress={() => router.back()} style={styles.backBtn}>
    <Text style={styles.backIcon}>‹</Text>
  </Pressable>

  <Text style={styles.title}>En İyiler</Text>
</View>
    {/* ÜST TABLAR */}
    <View style={styles.tabsRow}>
      <Pressable
  onPress={() => setTopTab("supporters")}
  style={[styles.tab, topTab === "supporters" && styles.tabActive]}
>
  <Text
    style={[
      styles.tabText,
      topTab === "supporters" && styles.tabTextActive,
    ]}
  >
    Destekçiler
  </Text>

  {topTab === "supporters" && (
    <View style={styles.topIndicator} />
  )}
</Pressable>

      <Pressable
        onPress={() => setTopTab("broadcasters")}
        style={[styles.tab, topTab === "broadcasters" && styles.tabActive]}
      >
        <Text
          style={[
            styles.tabText,
            topTab === "broadcasters" && styles.tabTextActive,
          ]}
        >
          Yayıncılar
        </Text>
        {topTab === "broadcasters" && (
  <View style={styles.topIndicator} />
)}
      </Pressable>
    </View>

    {/* ZAMAN TABLARI */}
    {/* ZAMAN TABLARI */}
<View style={styles.periodTabsShield}>
  <View style={styles.tabsRow}>
    <Pressable
      onPress={() => setPeriod("daily")}
      style={[styles.tabSmall, period === "daily" && styles.tabActive]}
    >
      <Text
        style={[
          styles.tabText,
          period === "daily" && styles.tabTextActive,
        ]}
      >
        Günlük
      </Text>
       {period === "daily" && <View style={styles.indicator} />}
    </Pressable>

    <Pressable
      onPress={() => setPeriod("weekly")}
      style={[styles.tabSmall, period === "weekly" && styles.tabActive]}
    >
      <Text
        style={[
          styles.tabText,
          period === "weekly" && styles.tabTextActive,
        ]}
      >
        Haftalık
      </Text>
      {period === "weekly" && <View style={styles.indicator} />}

    </Pressable>

    <Pressable
      onPress={() => setPeriod("monthly")}
      style={[styles.tabSmall, period === "monthly" && styles.tabActive]}
    >
      <Text
        style={[
          styles.tabText,
          period === "monthly" && styles.tabTextActive,
        ]}
      >
        Aylık
      </Text>
      {period === "monthly" && <View style={styles.indicator} />}

    </Pressable>
  </View>
</View>


    {/* LİSTE */}
    {loading ? (
      <View style={{ marginTop: 24 }}>
        <ActivityIndicator />
      </View>
    ) : list.length === 0 ? (
      <Text style={styles.empty}>Henüz sıralama oluşmadı.</Text>
    ) : (
      <>
       <View style={styles.podiumWrapper}>
  <TopThreePodium
    users={topThree.map((item) => ({
      ...item,
      user: usersMap[item.uid],
    }))}
  />
</View>

        {/* 🔥 4+ NORMAL LİSTE */}
        <FlatList
          key={`${topTab}-${period}`}
          data={restList}
          keyExtractor={(item) => item.uid}
          renderItem={({ item, index }) => (
            <RankingRow
              uid={item.uid}
              total={item.total}
              user={usersMap[item.uid]}
              index={index + 3}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80, }}
        />
      </>
    )}
  </ImageBackground>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 14,
      },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    marginBottom: 12,
  },

  tabsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  tab: {
  flex: 1,
   marginHorizontal: 25,
  paddingVertical: 1,
  borderRadius: 14,
  backgroundColor: "rgba(255,255,255,0.06)", // pasif soft gri
  alignItems: "center",
},

  tabSmall: {
  flex: 1,
  paddingVertical: 6,
  alignItems: "center",
  backgroundColor: "transparent", // ❗ artık buton değil
},

tabActive: {
  backgroundColor: "transparent",
},

tabText: {
  color: "rgba(255,255,255,0.5)",
  fontWeight: "600",
},

  tabTextActive: {
  color: "#fff",
  fontWeight: "800",
},

  empty: {
    color: "#bdbdbd",
    marginTop: 18,
    textAlign: "center",
  },
  periodTabsShield: {
  position: "relative",
  zIndex: 9999,
  elevation: 9999, // 🔴 ANDROID İÇİN ŞART
},
indicator: {
  marginTop: 4,
  width: 22,
  height: 3,
  borderRadius: 2,
  backgroundColor: "#facc15", // premium sıcak renk
},
topIndicator: {
  marginTop: 6,
  width: 28,
  height: 3,
  borderRadius: 2,
  backgroundColor: "#ffffff", // üst sekme için beyaz
  opacity: 0.9,
},
headerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

backBtn: {
  paddingRight: 10,
  paddingVertical: 4,
},

backIcon: {
  fontSize: 26,
  fontWeight: "800",
  color: "#fff",
},


});
