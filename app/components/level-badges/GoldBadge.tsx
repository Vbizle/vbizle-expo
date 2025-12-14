import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function GoldBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Metalik altın ana gradient */}
        <LinearGradient id="goldOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFF7CC" />
          <Stop offset="35%" stopColor="#F6C453" />
          <Stop offset="65%" stopColor="#D9A441" />
          <Stop offset="100%" stopColor="#FFE8A3" />
        </LinearGradient>

        {/* İç parlaklık */}
        <LinearGradient id="goldInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFDF5" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#C9972E" stopOpacity="0.95" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#goldOuter)"
        opacity={0.98}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#goldInner)"
        opacity={0.96}
      />

      {/* Alt minimal arma */}
      <G transform="translate(30 44)">
        <Path
          d="M2 0 L8 4 L4 10 L0 4 Z"
          fill="#B5892E"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
