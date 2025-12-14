import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function PlatinumBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Mavi–platin metalik ana gradient */}
        <LinearGradient id="platinumOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E6F0FF" />
          <Stop offset="35%" stopColor="#9DBCF9" />
          <Stop offset="65%" stopColor="#5B8DEF" />
          <Stop offset="100%" stopColor="#D6E6FF" />
        </LinearGradient>

        {/* İç parlaklık */}
        <LinearGradient id="platinumInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F7FAFF" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#3F83F8" stopOpacity="0.95" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#platinumOuter)"
        opacity={0.98}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#platinumInner)"
        opacity={0.96}
      />

      {/* Alt minimal arma */}
      <G transform="translate(30 44)">
        <Path
          d="M2 0 L8 4 L4 10 L0 4 Z"
          fill="#3F83F8"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
