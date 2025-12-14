import React from "react";
import { Text, View } from "react-native";

type Props = {
  diamonds: number;
  styles: any;
};

export default function ConvertTab({ diamonds, styles }: Props) {
  return (
    <View>
      <Text style={styles.title}>Elmas: {diamonds}</Text>
    </View>
  );
}
