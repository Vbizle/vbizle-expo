import React from "react";
import Svg, {
    Circle,
    Defs,
    LinearGradient,
    Path,
    Stop,
} from "react-native-svg";

type Props = {
  size?: number;
};

export default function MoneyBagIcon({ size = 9 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Defs>
        <LinearGradient id="gold" x1="0" y1="0" x2="0" y2="24">
          <Stop offset="0%" stopColor="#FFE9A3" />
          <Stop offset="55%" stopColor="#F5C96B" />
          <Stop offset="100%" stopColor="#C9972E" />
        </LinearGradient>
      </Defs>

      {/* Ağız / bağ */}
      <Path
        d="M9 7h6l-1 2H10z"
        fill="#D8B25A"
        stroke="#8A6A1F"
        strokeWidth={0.7}
        strokeLinejoin="round"
      />

      {/* Çuval gövdesi */}
      <Path
        d="M7 9c-2 2-3 4.6-3 7.2C4 19.7 6.9 22 12 22s8-2.3 8-5.8C20 13.6 19 11 17 9"
        fill="url(#gold)"
        stroke="rgba(120,80,0,0.95)"
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* VB parıltı noktası */}
      <Circle cx="12" cy="15" r="1.45" fill="#FFF3B0" />

      {/* Minimal “VB” hissi (çok küçük işaret) */}
      <Path d="M11.2 14.2h1.3c.6 0 .9.25.9.7s-.3.7-.9.7h-1.3z" fill="#7A5A16" />
    </Svg>
  );
}
