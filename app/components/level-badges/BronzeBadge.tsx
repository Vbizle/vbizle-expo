import React from "react";
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";

type Props = {
  size?: number;
};

export default function BronzeBadge({ size = 18 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        {/* Metalik bronz gradient */}
        <LinearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#5a2f1a" />
          <Stop offset="45%" stopColor="#c78955" />
          <Stop offset="100%" stopColor="#3b1e10" />
        </LinearGradient>

        {/* İç yüzey hafif parlama */}
        <LinearGradient id="bronzeInner" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#d9a36a" />
          <Stop offset="100%" stopColor="#7a4a2e" />
        </LinearGradient>
      </Defs>

      {/* Dış metal halka */}
      <Circle
        cx="50"
        cy="50"
        r="46"
        stroke="url(#bronzeGrad)"
        strokeWidth="6"
        fill="none"
      />

      {/* İç disk */}
      <Circle
        cx="50"
        cy="50"
        r="34"
        fill="url(#bronzeInner)"
        opacity={0.95}
      />

      {/* Alt arma (minimal, premium) */}
      <G transform="translate(30 63)">
        <Path
          d="M20 0 L28 10 L20 20 L12 10 Z"
          fill="#2a140a"
          opacity={0.9}
        />
      </G>
    </Svg>
  );
}
