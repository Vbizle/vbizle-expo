import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function LoadTypeSelector({
  loadType,
  setLoadType,
  styles,
}: {
  loadType: string;
  setLoadType: (v: any) => void;
  styles: any;
}) {
  return (
    <View style={styles.typeRow}>
      {["root", "dealer", "system"].map((t) => (
        <TouchableOpacity
          key={t}
          style={[styles.typeBtn, loadType === t && styles.typeActive]}
          onPress={() => setLoadType(t as any)}
        >
          <Text style={styles.typeText}>{t.toUpperCase()}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
