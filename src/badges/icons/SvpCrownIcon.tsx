import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  colors?: [string, string]; // SVP gradientinden gelecek
};

export default function SvpCrownIcon({
  size = 10,
  colors = ["#FFD36A", "#C99700"], // fallback altın
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="crownGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>

      <Path
        d="M3 7l3 6 4-4 2 4 4-4 3 6v4H3V7z"
        fill="url(#crownGrad)"
      />
    </Svg>
  );
}
