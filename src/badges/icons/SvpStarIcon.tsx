import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  colors?: [string, string];
};

export default function SvpDoubleStarIcon({
  size = 8.5,
  colors = ["#EAFBFF", "#4FDBFF"],
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>

      <Path
        d="M12 2l2.2 4.8 5.3.8-3.8 3.7.9 5.3-4.6-2.4-4.6 2.4.9-5.3-3.8-3.7 5.3-.8L12 2z"
        fill="url(#starGrad)"
      />
    </Svg>
  );
}
