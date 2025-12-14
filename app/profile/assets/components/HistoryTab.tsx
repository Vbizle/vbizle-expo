import React from "react";
import { Text, View } from "react-native";

type Props = {
  history: any[];
  styles: any;
};

export default function HistoryTab({ history, styles }: Props) {
  return (
    <View style={{ marginTop: 20 }}>
      {history.length === 0 ? (
        <Text style={{ opacity: 0.7 }}>Henüz kayıt yok.</Text>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyUser}>
              {item.fromName || "Bilinmeyen"} → {item.amount} VB
            </Text>
            <Text style={styles.historyDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
