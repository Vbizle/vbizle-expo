import React from "react";
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export default function MasterBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        {/* Master: mor–pembe metalik ana gradient */}
        <LinearGradient id="masterOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5D0FE" />
          <Stop offset="35%" stopColor="#C084FC" />
          <Stop offset="65%" stopColor="#A855F7" />
          <Stop offset="100%" stopColor="#FCE7F3" />
        </LinearGradient>

        {/* İç parlaklık */}
        <LinearGradient id="masterInner" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FAF5FF" stopOpacity="0.95" />
          <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.95" />
        </LinearGradient>
      </Defs>

      {/* Dış halka */}
      <Circle
        cx="32"
        cy="32"
        r="30"
        fill="url(#masterOuter)"
        opacity={0.98}
      />

      {/* İç disk */}
      <Circle
        cx="32"
        cy="32"
        r="20"
        fill="url(#masterInner)"
        opacity={0.96}
      />

      {/* Alt minimal arma */}
      <G transform="translate(30 44)">
        <Path
          d="M2 0 L8 4 L4 10 L0 4 Z"
          fill="#9333EA"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
