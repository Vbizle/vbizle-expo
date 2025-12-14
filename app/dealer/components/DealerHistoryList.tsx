import React from "react";
import { FlatList, Image, Text, View } from "react-native";
import styles from "../styles";

type Props = {
  data: any[];
  formatVB: (value: number) => string;
};

export default function DealerHistoryList({ data, formatVB }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      renderItem={({ item }) => (
        <View style={styles.logItem}>
          <Image source={{ uri: item.avatar }} style={styles.logAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.logName}>{item.username}</Text>
            <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
          </View>
          <Text style={styles.logDate}>
            {new Date(item.date).toLocaleString("tr-TR")}
          </Text>
        </View>
      )}
    />
  );
}
