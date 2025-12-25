import UserBadgesRow from "@/src/badges/components/UserBadgesRow";
import { useRealtimeUserBadges } from "@/src/badges/hooks/useRealtimeUserBadges";
import { getLevelInfo } from "@/src/utils/levelSystem";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";




type Props = {
  uid: string;
  total: number;
  user?: {
    username?: string;
    avatar?: string;
    vipLevel?: number;
    svpLevel?: number;
  };
  index: number;
};

export default function RankingRow({ uid, total, user, index }: Props) {
  const router = useRouter();
  const { badges } = useRealtimeUserBadges(uid);
const levelInfo = getLevelInfo(badges?.vbTotalSent ?? 0);

  return (
    <Pressable
      onPress={() => router.push(`/profile/user/${uid}`)}
      style={styles.row}
    >
      {index >= 3 && (
  <Text style={styles.rank}>{index + 1}.</Text>
)}


      <Image
        source={{
          uri:
            user?.avatar ||
            "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
        }}
        style={styles.avatar}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.username} numberOfLines={1}>
          {user?.username || "Kullanıcı"}
        </Text>

       {badges && (
  <View
    style={{
      marginTop: 4,

      // 🔥 YAKINLAŞTIRMA
      transform: [
        { scaleX: 0.75 },
        { scaleY: 0.92 },

        // 🔥 SOLA ÇEKME
        { translateX: -40 }, // 👈 ihtiyaca göre -4 / -8
      ],
    }}
  >
    <UserBadgesRow
      levelInfo={levelInfo}
      vipScore={badges?.vipScore ?? 0}
      svpLevel={badges?.svp?.level ?? 0}
      isDealer={badges?.roles?.dealer === true}
      roles={badges?.roles}
      hideLevel
      hideDealer
      compact
      wrap
    />
  </View>
)}
      </View>

      <Text style={styles.total}>{total}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
},
  rank: {
    width: 42,
    fontWeight: "800",
    color: "#fff",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#facc15",
  },
  total: {
    minWidth: 70,
    textAlign: "right",
    fontWeight: "800",
    color: "#fff",
  },
});
