import React from "react";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
};

export default function TestSvg({ size = 28 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="50" cy="50" r="40" fill="#4ade80" />
    </Svg>
  );
}
