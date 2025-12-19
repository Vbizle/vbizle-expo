import React from "react";
import Svg, { Path } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export default function SvpDoubleStarIcon({
  size = 6.5,
  color = "#FFFFFF",
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* BÜYÜK YILDIZ */}
      <Path
        d="M12 2l2.2 4.8 5.3.8-3.8 3.7.9 5.3-4.6-2.4-4.6 2.4.9-5.3-3.8-3.7 5.3-.8L12 2z"
        fill={color}
      />

      {/* KÜÇÜK KRİSTAL */}
      <Path
        d="M17.5 13l1.2 2.2 2.2.4-1.7 1.7.4 2.2-2.1-1.1-2.1 1.1.4-2.2-1.7-1.7 2.2-.4 1.2-2.2z"
        fill="rgba(255,255,255,0.85)"
      />
    </Svg>
  );
}
