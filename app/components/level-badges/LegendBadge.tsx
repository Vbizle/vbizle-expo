import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function LegendBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Legend: altın + mor ultra premium dış gradient */}
        <LinearGradient id="legendOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF1C1" />
          <Stop offset="30%" stopColor="#F6C453" />
          <Stop offset="55%" stopColor="#A855F7" />
          <Stop offset="100%" stopColor="#FDE68A" />
        </LinearGradient>

        {/* İç parlaklık (derin ve zengin) */}
        <LinearGradient id="legendInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFBEB" stopOpacity="0.96" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.96" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#legendOuter)"
        opacity={0.99}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#legendInner)"
        opacity={0.97}
      />

      {/* Alt arma (daha güçlü kontrast) */}
      <G transform="translate(29 43)">
        <Path
          d="M3 0 L10 4 L5 12 L0 4 Z"
          fill="#6D28D9"
          opacity={0.95}
        />
      </G>
    </Svg>
  );
}
