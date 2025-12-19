import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

// 🔹 SVP ICONLARI
import SvpBadgeIcon from "@/src/badges/icons/SvpBadgeIcon";
import SvpCrownIcon from "@/src/badges/icons/SvpCrownIcon";
import SvpDiamondIcon from "@/src/badges/icons/SvpDiamondIcon";
import SvpMedalIcon from "@/src/badges/icons/SvpMedalIcon";
import SvpStarIcon from "@/src/badges/icons/SvpStarIcon";

type Props = {
  level: number; // 1–5
};

const SVP_COLORS: Record<number, string[]> = {
  1: ["#065F46", "#10B981"],
  2: ["#1E3A8A", "#2563EB"],
  3: ["#0a011dff", "#4fbfdbff"],
  4: ["#360bf3ff", "#ee1616ff"],
  5: ["#f70b0bff", "#06010fff"],
};

const SHIMMER_DURATION: Record<number, number> = {
  1: 9000,  // yavaş, zarif
  2: 7500,  // sakin
  3: 6000,  // dengeli
  4: 4500,  // güçlü
  5: 3200,  // hızlı elit (AYNI)
};

const SHIMMER_OPACITY: Record<number, number> = {
  1: 0.1,   // çok hafif kalite hissi
  2: 0.14,  // fark edilir ama sakin
  3: 0.18,  // orta elit
  4: 0.22,  // güçlü ama SVP5'i geçmez
  5: 0.28,  // zirve (AYNI)
};
const SHIMMER_COLORS: Record<number, string[]> = {
  1: [
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0.6)",
    "rgba(255,255,255,0)",
  ],

  2: [
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0)",
  ],

  // 🤍 SVP3 — BEYAZ (ELİT)
  3: [
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0.95)",
    "rgba(255,255,255,0)",
  ],

  // 🩶 SVP4 — GÜMÜŞ
  4: [
    "rgba(255,255,255,0)",
    "rgba(220,220,220,0.95)",
    "rgba(255,255,255,0)",
  ],

  // 🟡 SVP5 — ALTIN
  5: [
    "rgba(255,255,255,0)",
    "rgba(255,220,150,0.95)",
    "rgba(255,255,255,0)",
  ],
};


// 🔹 OTOMATİK SVP ICON SEÇİMİ
function getSvpIcon(level: number, colors: string[]) {
  switch (level) {
    case 5:
      return <SvpCrownIcon size={10} colors={colors as any} />;       // 👑 ZİRVE (AYNI)
    case 4:
      return <SvpMedalIcon size={9} colors={colors as any} />;        // 🛡️ AYNI
    case 3:
      return <SvpBadgeIcon size={8.5} colors={colors as any} />;      // 🟣 YENİ (badge)
    case 2:
      return <SvpDiamondIcon size={8.5} colors={colors as any} />;    // ◆ YENİ (diamond)
    case 1:
      return (
        <SvpStarIcon
          size={7}
          color="rgba(255,255,255,0.6)"
        />
      );
    default:
      return null;
  }
}

export default function SvpBadge({ level }: Props) {
  const colors = SVP_COLORS[level] || SVP_COLORS[1];
  const isElite = level === 5;

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: SHIMMER_DURATION[level] || 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [level]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 120],
  });

  return (
    <View style={styles.wrapper}>
      {/* ⭐ SVP5 ELİT HALO */}
      {isElite && (
        <View
          pointerEvents="none"
          style={[
            styles.eliteHalo,
            { shadowColor: colors[0] },
          ]}
        />
      )}

      <LinearGradient
        colors={[colors[1], "#FFFFFF", colors[0]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.border}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.badge}
        >
         <View style={styles.contentRow}>
  <View style={styles.iconWrapper}>
  <View
    style={[
      styles.iconScale,
      level === 5 && styles.iconScaleElite,
    ]}
  >
    {getSvpIcon(level, colors)}
  </View>
</View>
  <Text style={styles.text}>SVP{level}</Text>
</View>

          <View style={styles.gloss} />

          <Animated.View
  pointerEvents="none"
  style={[
    styles.shimmer,
    {
      opacity: SHIMMER_OPACITY[level] || 0.1,
      transform: [{ translateX }],
    },
  ]}
>
  <LinearGradient
    colors={SHIMMER_COLORS[level] || SHIMMER_COLORS[3]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{ flex: 1 }}
  />
</Animated.View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginLeft: 4,
  },

  eliteHalo: {
    position: "absolute",
    top: -4,
    bottom: -4,
    left: -4,
    right: -4,
    borderRadius: 14,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },

  border: {
    borderRadius: 10,
    padding: 1.2,
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },

  // 🔹 ICON + TEXT SATIRI
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  // 🔥 SADECE İÇERDEKİ İKON BÜYÜR
  iconScale: {
    transform: [{ scale: 1.75 }],
  },

  // 👑 SVP5 BİR TIK DAHA BÜYÜK
  iconScaleElite: {
    transform: [{ scale: 1.50 }],
  },
  text: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.4,
    textShadowColor: "rgba(255,255,255,0.45)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "40%",
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  shimmer: {
    position: "absolute",
    top: 1,
    bottom: 1,
    width: 46,
     borderRadius: 8,     // 🔥 badge ile AYNI
  overflow: "hidden", // 🔥 kırpma
    backgroundColor: "#FFFFFF",
  },
  iconWrapper: {
  marginRight: 1,
  padding: 1.5,
  borderRadius: 6,

  // 🔥 METAL DAMGA ETKİSİ
  backgroundColor: "rgba(255,255,255,0.12)",

  shadowColor: "#FFFFFF",
  shadowOpacity: 0.45,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 0 },

  elevation: 2,
},

});
