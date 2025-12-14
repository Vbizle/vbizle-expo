import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function SilverBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Metalik gümüş ana gradient */}
        <LinearGradient id="silverOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F3F4F6" />
          <Stop offset="40%" stopColor="#D1D5DB" />
          <Stop offset="70%" stopColor="#9CA3AF" />
          <Stop offset="100%" stopColor="#E5E7EB" />
        </LinearGradient>

        {/* İç parlaklık */}
        <LinearGradient id="silverInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#9CA3AF" stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#silverOuter)"
        opacity={0.98}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#silverInner)"
        opacity={0.95}
      />

      {/* Alt minimal arma */}
      <G transform="translate(30 44)">
        <Path
          d="M2 0 L8 4 L4 10 L0 4 Z"
          fill="#9CA3AF"
          opacity={0.85}
        />
      </G>
    </Svg>
  );
}
