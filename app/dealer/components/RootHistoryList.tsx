import React from "react";
import { FlatList, Image, Text, View } from "react-native";
import styles from "../styles";

type Props = {
  data: any[];
  formatVB: (value: number) => string;
};

export default function RootHistoryList({ data, formatVB }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const date =
          typeof item.createdAt === "number"
            ? new Date(item.createdAt)
            : item.createdAt?.toDate?.();

        return (
          <View style={styles.logItem}>
            <Image
              source={{
                uri:
                  item.admin?.avatar ||
                  item.avatar ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              }}
              style={styles.logAvatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.logName}>
                {item.admin?.username || item.username || "Root"}
              </Text>
              <Text style={styles.logAmount}>+{formatVB(item.amount)} VB</Text>
            </View>
            <Text style={styles.logDate}>
              {date ? date.toLocaleString("tr-TR") : ""}
            </Text>
          </View>
        );
      }}
    />
  );
}
