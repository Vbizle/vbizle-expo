import { MARKET_CATALOG } from "@/src/market/catalog";
import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import MarketStatusCard from "../components/MarketStatusCard";

export default function MarketStatusTab() {
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      {MARKET_CATALOG
        .filter((item) => item.active)
        .map((item) => (
          <MarketStatusCard key={item.id} item={item} />
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
  },
});
