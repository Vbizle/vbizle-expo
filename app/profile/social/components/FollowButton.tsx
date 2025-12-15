import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type Props = {
  isFollowing: boolean;
  isFriend: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
};

export default function FollowButton({
  isFollowing,
  isFriend,
  onFollow,
  onUnfollow,
}: Props) {
  let label = "Takip Et";
  let action = onFollow;

  if (isFriend) {
    label = "Arkadaşlıktan Çıkar";
    action = onUnfollow;
  } else if (isFollowing) {
    label = "Takibi Bırak";
    action = onUnfollow;
  }

  return (
    <TouchableOpacity style={styles.btn} onPress={action}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#222",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
