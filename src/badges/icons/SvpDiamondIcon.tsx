import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  colors?: [string, string];
};

export default function SvpDiamondIcon({
  size = 8.5,
  colors = ["#6FE7FF", "#0077FF"],
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="diamondFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>

        {/* METALİK ÇERÇEVE */}
        <LinearGradient id="diamondStroke" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#E8F9FF" />
          <Stop offset="50%" stopColor="#9BDFFF" />
          <Stop offset="100%" stopColor="#3A9DFF" />
        </LinearGradient>
      </Defs>

      {/* 🔹 METALİK KANAT / ÇERÇEVE */}
      <Path
        d="M12 2L22 9l-10 13L2 9 12 2z"
        fill="none"
        stroke="url(#diamondStroke)"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />

      {/* 🔹 İÇ KRİSTAL */}
      <Path
        d="M12 2L22 9l-10 13L2 9 12 2z"
        fill="url(#diamondFill)"
      />
    </Svg>
  );
}
