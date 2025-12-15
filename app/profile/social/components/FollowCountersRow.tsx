import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FollowCounts } from "../types";

type Props = {
  counts: FollowCounts;
  onPressFollowing: () => void;
  onPressFriends: () => void;
  onPressFollowers: () => void;
};

export default function FollowCountersRow({
  counts,
  onPressFollowing,
  onPressFriends,
  onPressFollowers,
}: Props) {
  return (
    <View style={styles.row}>
      <Counter
        label="Takip"
        value={counts.following}
        onPress={onPressFollowing}
      />
      <Counter
        label="Arkadaş"
        value={counts.friends}
        onPress={onPressFriends}
      />
      <Counter
        label="Takipçi"
        value={counts.followers}
        onPress={onPressFollowers}
      />
    </View>
  );
}

function Counter({
  label,
  value,
  onPress,
}: {
  label: string;
  value: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  justifyContent: "space-around",
  marginTop: 29,     // header'dan uzaklaştırır
  marginBottom: -25, 
  },
  item: {
    alignItems: "center",
    width: 100,
  },
  value: {
    fontSize: 16,
    fontWeight: "700",
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});
