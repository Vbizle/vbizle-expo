import { View } from "react-native";
import BronzeBadge from "./level-badges/BronzeBadge";

export default function SvgTestScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
      }}
    >
      <BronzeBadge size={64} />
    </View>
  );
}
