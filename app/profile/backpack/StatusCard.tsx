import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

type Props = {
  title: string;
  expiresAt?: number;
  isActive: boolean;
  hideInLists: boolean;
  onToggleActive: (v: boolean) => void;
  onToggleHide: (v: boolean) => void;
};

function daysLeft(ts?: number) {
  if (!ts) return null;
  const diff = ts - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function StatusCard({
  title,
  expiresAt,
  isActive,
  hideInLists,
  onToggleActive,
  onToggleHide,
}: Props) {
  const left = daysLeft(expiresAt);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>

      {left !== null && (
        <Text style={styles.sub}>
          Kalan süre: {left} gün
        </Text>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>Statüyü aktif et</Text>
        <Switch value={isActive} onValueChange={onToggleActive} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Listelerde gizle</Text>
        <Switch value={hideInLists} onValueChange={onToggleHide} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  sub: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
