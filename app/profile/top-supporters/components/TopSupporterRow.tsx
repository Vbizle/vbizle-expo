import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import UserBadgesRow from "@/src/badges/components/UserBadgesRow";
import { useRealtimeUserBadges } from "@/src/badges/hooks/useRealtimeUserBadges";
import { getLevelInfo } from "@/src/utils/levelSystem";

type Props = {
  data: {
    supporterUid: string;
    totalVb: number;
    username?: string;
    avatar?: string;
    age?: number;
    gender?: "male" | "female";
    country?: string;
  };
  rank: number;
};

function formatDiamond(value: number) {
  return new Intl.NumberFormat("tr-TR").format(Number(value || 0));
}

export default function TopSupporterRow({ data, rank }: Props) {
  const router = useRouter();
  const isTop3 = rank <= 3;
  const PLATFORM_ROOT_UID = "9G9jqVmQSdZXVD6B6ah8w8nJwDw2";
const isRootUser = data.supporterUid === PLATFORM_ROOT_UID;


  const { badges } = useRealtimeUserBadges(data.supporterUid);
  const levelInfo = getLevelInfo(badges?.vbTotalSent ?? 0);



  const avatarSource = data.avatar
    ? { uri: data.avatar }
    : require("../../../../assets/icons/user-placeholder.png");

  /** 🔹 SOL SLOT */
  const RankSlot = () => {
    if (rank === 1) return <Text style={styles.crown}>👑</Text>;
    if (rank === 2) return <Text style={styles.medal}>🥈</Text>;
    if (rank === 3) return <Text style={styles.medal}>🥉</Text>;
    return <Text style={styles.rankText}>{rank}.</Text>;
  };

  const content = (
    <>
      {/* SOL SLOT */}
      <View style={styles.rankSlot}>
        <RankSlot />
      </View>

      {/* AVATAR */}
      <Image source={avatarSource} style={styles.avatar} />

      {/* ORTA */}
      <View style={styles.mid}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {data.username || "Kullanıcı"}
            </Text>

            {data.gender && data.age ? (
              <View
                style={[
                  styles.miniBadge,
                  {
                    backgroundColor:
                      data.gender === "male" ? "#3B82F6" : "#EC4899",
                  },
                ]}
              >
                <Text style={styles.miniBadgeText}>
                  {data.gender === "male" ? "♂" : "♀"}
                  {data.age}
                </Text>
              </View>
            ) : null}

            {data.country ? (
              <Text style={styles.miniFlag}>{data.country}</Text>
            ) : null}
          </View>

          {/* 💎 */}
          <View style={styles.amountRow}>
            <Text style={styles.diamond}>💎</Text>
            <Text style={styles.amount}>{formatDiamond(data.totalVb)}</Text>
          </View>
        </View>

        {/* ROZETLER */}
       {!isRootUser && (
  <View style={styles.badgeWrap}>
    <UserBadgesRow
      levelInfo={levelInfo}
      vipScore={badges?.vipScore ?? 0}
      svpLevel={badges?.svp?.level ?? 0}
      isDealer={badges?.roles?.dealer === true}
      roles={badges?.roles}
      compact
      wrap
    />
  </View>
)}
      </View>
    </>
  );

  /* =======================
     🥇🥈🥉 PREMIUM ÇERÇEVELER
     ======================= */
  if (isTop3) {
    const frame =
      rank === 1
        ? {
            border: ["#f7d046", "#b8860b"],
            inner: ["#ffcccf8e", "#f3c623"],
            glow: "rgba(247,208,70,0.6)",
          }
        : rank === 2
        ? {
            border: ["#f08f8c65", "#f08f8c71"],
            inner: ["#8bb2daff", "#b7d1f1ff"],
            glow: "rgba(207,211,216,0.6)",
          }
        : {
            border: ["#0f0f0f49", "#0f0f0f49"],
            inner: ["#d3f1ca7e", "#d3f1ca8e"],
            glow: "rgba(205,127,50,0.6)",
          };

    return (
      <Pressable
        onPress={() => router.push(`/profile/user/${data.supporterUid}`)}
        style={{ marginBottom: 10 }}
      >
        {/* DIŞ ÇERÇEVE */}
        <LinearGradient
          colors={frame.border}
          style={[
            styles.premiumBorder,
            { shadowColor: frame.glow },
          ]}
        >
          {/* İÇ KART */}
          <LinearGradient colors={frame.inner} style={styles.premiumInner}>
            {content}
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    );
  }

  /* ===== NORMAL ===== */
  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push(`/profile/user/${data.supporterUid}`)}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /* ====== PREMIUM ====== */
  premiumBorder: {
    borderRadius: 20,
    padding: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  premiumInner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 1,
     minHeight: 65,          // 🔥 TÜM TOP KARTLAR AYNI BOY
  alignContent: "flex-start",
  },

  /* ====== NORMAL ====== */
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 1,
    marginBottom: 6,
    backgroundColor: "#F3F4F6",
     minHeight: 65, // 🔒 TOP ile görsel denge
  },

  /* SOL SLOT */
  rankSlot: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  crown: { fontSize: 18 },
  medal: { fontSize: 16 },
  rankText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
  },

  /* AVATAR */
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  /* MID */
  mid: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "65%",
  },
  username: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  /* 💎 */
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  diamond: {
    fontSize: 13,
    marginRight: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
  },

  /* ROZET WRAP */
  badgeWrap: {
    marginTop: 2,
    transform: [{ scale: 0.9 }],
    transformOrigin: "left",
  },

  /* mini meta */
  miniBadge: {
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 10,
    marginLeft: 4,
  },
  miniBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  miniFlag: {
    fontSize: 14,
    marginLeft: 2,
  },
});
