
import UserBadgesRow from "@/src/badges/components/UserBadgesRow";
import { useRealtimeUserBadges } from "@/src/badges/hooks/useRealtimeUserBadges";
import { usePodiumAssets } from "@/src/rankings/hooks/usePodiumAssets";
import { getLevelInfo } from "@/src/utils/levelSystem";
import { useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from "react-native";


type UserItem = {
  uid: string;
  total: number;
  user?: {
    username?: string;
    avatar?: string;
    vipLevel?: number;
    svpLevel?: number;
  };
};

type Props = {
  users: UserItem[];
};

const { width: screenWidth } = Dimensions.get("window");
const isSmallScreen = screenWidth <= 380;

export default function TopThreePodium({ users }: Props) {
  const router = useRouter();
  const podiumAssets = usePodiumAssets();
    // 🔹 TOP 3 UID’LER
  const uid0 = users?.[0]?.uid ?? "";
  const uid1 = users?.[1]?.uid ?? "";
  const uid2 = users?.[2]?.uid ?? "";

  // 🔹 PROFİLDE KULLANILAN AYNI BADGE ENGINE
  const b0 = useRealtimeUserBadges(uid0);
  const b1 = useRealtimeUserBadges(uid1);
  const b2 = useRealtimeUserBadges(uid2);
  

  if (!users || users.length === 0) return null;

  const renderUser = (
  item: UserItem | undefined,
  rank: 1 | 2 | 3,
  badges: any
) => {
    if (!item) return <View style={{ flex: 1 }} />;
     const levelInfo = getLevelInfo(badges?.vbTotalSent ?? 0);
    const isFirst = rank === 1;

    return (
      <Pressable
        onPress={() => router.push(`/profile/user/${item.uid}`)}
        style={styles.card}
      >
        <View style={styles.podiumWrapper}>

  {/* 👤 AVATAR — ALTA */}
  <View
    style={[
      styles.avatarAnchor,
      isFirst ? styles.avatarFirst : styles.avatarSide,
    ]}
  >
    <Image
      source={{
        uri:
          item.user?.avatar ||
          "https://cdn-icons-png.flaticon.com/512/6596/6596121.png",
      }}
      style={[
        styles.avatar,
        isFirst ? styles.firstAvatar : styles.sideAvatar,
      ]}
    />
  </View>

  {/* 🟡 PODIUM PNG — ÜSTE */}
  <View style={styles.podiumClip}>
    <Image
      source={{ uri: podiumAssets.assets?.[`top${rank}`] }}
      style={[
        styles.podiumImage,
        rank === 1 && styles.podiumFirst,
        rank === 2 && styles.podiumSecond,
        rank === 3 && styles.podiumThird,
      ]}
      resizeMode="contain"
    />
  </View>


          {/* ℹ️ INFO */}
          <View style={styles.infoWrapper}>
            <Text
  style={styles.username}
  numberOfLines={1}
  ellipsizeMode="clip"   // 🔴 RN ... KAPALI
>
  {truncateUsername(item.user?.username || "Kullanıcı", 6)}
</Text>

  {/* VIP / SVP — SADECE YAZI */}
{badges && (
  <View
    style={{
      marginTop: 2,
      transform: [{ scale: 0.85 }],
      position: "relative",
    }}
  >
    <View
  style={{
    marginTop: 0,
    transform: [
      { scaleX: 0.70 },   // 🔥 VIP ↔ SVP arası daralır
      { scaleY: 0.95 },   // opsiyonel (çok az)
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
  />
</View>

    {/* 🔒 LEVEL ÜSTÜNE MASKE */}
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 16,            // 🔥 LEVEL yüksekliği
        backgroundColor: "transparent",
      }}
    />
  </View>
)}

            <Text style={styles.total}>{formatScore(item.total)}</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.podiumSection}>
      <View style={styles.container}>
       {renderUser(users[1], 2, b1.badges)}
{renderUser(users[0], 1, b0.badges)}
{renderUser(users[2], 3, b2.badges)}
      </View>
    </View>
  );
}

/* ---------------- helpers ---------------- */

function formatScore(value: number) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
  return String(value);
}
function truncateUsername(name: string, limit = 8) {
  if (!name) return "";
  return name.length > limit ? name.slice(0, limit) + "..." : name;
}

/* ---------------- styles ---------------- */

const styles = StyleSheet.create({
  podiumSection: {
    height: isSmallScreen ? 260 : 300,
  },

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },

  card: {
    flex: 1,
    alignItems: "center",
  },

  podiumWrapper: {
    position: "relative",
    width: "100%",
    height: 260,
    alignItems: "center",
  },

  /* 🟡 PNG */
  podiumClip: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 260,
    overflow: "hidden",
    alignItems: "center",
     overflow: "visible", 
  },

  podiumImage: {
    position: "absolute",
    top: 0,
    
  },

  podiumFirst: {
  width: isSmallScreen ? 260 : 290,
  height: isSmallScreen ? 433 : 420,
  top: isSmallScreen ? -60 : -40,
},

podiumSecond: {
  width: isSmallScreen ? 185 : 200,
  height: isSmallScreen ? 308 : 380,
  top: isSmallScreen ? -22 : -30,
},

podiumThird: {
  width: isSmallScreen ? 180 : 190,
  height: isSmallScreen ? 302 : 380,
  top: isSmallScreen ? -28 : -40,
},

  /* 👤 AVATAR */
  avatarAnchor: {
    position: "absolute",
    alignItems: "center",
    
  },

  avatarFirst: {
      top: isSmallScreen ? 15 : 18,
    
  },

  avatarSide: {
    top: isSmallScreen ? 12 : 34, // ⬆️ YUKARI ALINDI
  },

  avatar: {
    borderRadius: 999,
  },

  firstAvatar: {
    width: 85,
    height: 85,
    
  },

  sideAvatar: {
    width: 75,
    height: 75,
   
  },

  /* ℹ️ INFO */
  infoWrapper: {
    position: "absolute",
    bottom: 75,
    alignItems: "center",
  },

  username: {
  fontSize: 14,
  fontWeight: "700",
  color: "#ffffffff",
  textAlign: "center",
  maxWidth: 90,        // podium için sabit
},

  badges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },

  badge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#facc15",
  },

  total: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
  },
  badgeText: {
  fontSize: 11,
  fontWeight: "800",
  color: "#facc15",
},

});
