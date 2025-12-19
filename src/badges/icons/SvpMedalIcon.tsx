import React from "react";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
  colors?: [string, string];
};

export default function SvpMedalIcon({
  size = 9,
  colors = ["#E6E6E6", "#9B9B9B"],
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="medalGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={colors[0]} />
          <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <Stop offset="100%" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>

      <Path
        d="M12 2l7 4v6c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-4z"
        fill="url(#medalGrad)"
      />
    </Svg>
  );
}
