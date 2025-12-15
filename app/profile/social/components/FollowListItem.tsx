import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MiniUser } from "../types";

type Props = {
  user: MiniUser;
  actionLabel?: string;
  onAction?: () => void;
};

export default function FollowListItem({
  user,
  actionLabel,
  onAction,
}: Props) {
  return (
    <View style={styles.row}>
      <Image
        source={{
          uri:
            user.avatar ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={styles.avatar}
      />
      <Text style={styles.name}>
        {user.username || "Kullanıcı"}
      </Text>

      {actionLabel && onAction && (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  action: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#eee",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
