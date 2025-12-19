import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { getLevelBadge } from "@/app/components/level-badges/levelBadgeMap";
import { getVipColor, getVipLabel, getVipRank } from "@/src/utils/vipSystem";

// 🆕 ROLE ROZETLERİ
import AdminBadge from "./AdminBadge";
import DealerBadge from "./DealerBadge";
import SvpBadge from "./SvpBadge";

type Props = {
  levelInfo: {
    level: number;
    label: string;
    color: string;
  };
  vipScore: number;

  roles?: {
    admin?: boolean;
    dealer?: boolean;
  };

  svpLevel?: number; // 🆕 SVP 1–5
  isDealer?: boolean; // 👈 SADECE BUNU EKLİYORUZ
};

export default function UserBadgesRow({
  levelInfo,
  vipScore,
  roles,
  svpLevel = 0,
  isDealer,
}: Props) {
  const vipRank = getVipRank(vipScore);
  const vipColor = getVipColor(vipRank);
  const LevelBadge = getLevelBadge(levelInfo.level);
  const resolvedIsDealer =
    isDealer === true || roles?.dealer === true;

  // 🔍 DEBUG — GEÇİCİ
  console.log("🟡 BadgeRow", {
    isDealer,
    rolesDealer: roles?.dealer,
    resolvedIsDealer,
  });

  return (
    <View style={styles.row}>
      {/* LV KAPSÜLÜ */}
      <View
        style={[
          styles.levelTag,
          {
            backgroundColor: levelInfo.color,
          },
        ]}
      >
        {LevelBadge && (
          <View style={{ marginRight: 4, marginTop: 1 }}>
            <LevelBadge size={11} />
          </View>
        )}

        <Text style={styles.levelText}>{levelInfo.label}</Text>

        {/* ✨ Metalik parlama */}
        <View style={styles.glossOverlay} />
      </View>

      <View style={{ width: 4 }} />

      {/* VIP KAPSÜLÜ */}
      <View
        style={[
          styles.vipTag,
          {
            backgroundColor: vipColor,
          },
        ]}
      >
        <Text style={styles.vipText}>{getVipLabel(vipRank)}</Text>
        <View style={styles.glossOverlay} />
      </View>

      {/* ROLE ROZETLERİ */}
      {roles?.admin === true && <AdminBadge />}

      {/* 💎 SVP (1/5 – 5/5) */}
      {svpLevel > 0 && <SvpBadge level={svpLevel} />}

      {/* 🟡 BAYİ – SABİT STATÜ */}
      {resolvedIsDealer === true && (
        <View style={styles.dealerWrapper}>
          <DealerBadge />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  /* =========================
     LEVEL BADGE – METALİK
  ========================= */
  levelTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 8,

    // Metalik detaylar
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.35)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },

    elevation: 2,
    overflow: "hidden",
  },

  levelText: {
    color: "#FDFDFD",
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.2,
    textShadowColor: "rgba(255,255,255,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  /* =========================
     VIP BADGE – METALİK
  ========================= */
  vipTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,

    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.35)",

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },

    elevation: 2,
    overflow: "hidden",
  },

  vipText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.3,
    textShadowColor: "rgba(255,255,255,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  /* =========================
     METALİK PARLAMA KATI
  ========================= */
  glossOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dealerWrapper: {
  marginLeft: 6, // SVP ↔ BAYİ arası boşluk
},

});
