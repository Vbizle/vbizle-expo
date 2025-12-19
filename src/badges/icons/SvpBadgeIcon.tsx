import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  colors?: [string, string];
};

export default function SvpBadgeIcon({
  size = 8.5,
  colors = ["#B388FF", "#5E17EB"],
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="badgeFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>

        {/* METALİK ÇERÇEVE */}
        <LinearGradient id="badgeStroke" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#E9D8FF" />
          <Stop offset="50%" stopColor="#B18CFF" />
          <Stop offset="100%" stopColor="#6A32FF" />
        </LinearGradient>
      </Defs>

      {/* 🔹 METALİK ARMA KENARI */}
      <Path
        d="M12 2l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-4z"
        fill="none"
        stroke="url(#badgeStroke)"
        strokeWidth={1.3}
        strokeLinejoin="round"
      />

      {/* 🔹 İÇ YÜZEY */}
      <Path
        d="M12 2l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-4z"
        fill="url(#badgeFill)"
      />
    </Svg>
  );
}
