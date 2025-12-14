import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function DiamondBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Elmas: mor–mavi metalik ana gradient */}
        <LinearGradient id="diamondOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E9D5FF" />
          <Stop offset="35%" stopColor="#8B5CF6" />
          <Stop offset="65%" stopColor="#3B82F6" />
          <Stop offset="100%" stopColor="#DBEAFE" />
        </LinearGradient>

        {/* İç parlaklık */}
        <LinearGradient id="diamondInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#4F46E5" stopOpacity="0.95" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#diamondOuter)"
        opacity={0.98}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#diamondInner)"
        opacity={0.96}
      />

      {/* Alt minimal arma */}
      <G transform="translate(30 44)">
        <Path
          d="M2 0 L8 4 L4 10 L0 4 Z"
          fill="#6366F1"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
